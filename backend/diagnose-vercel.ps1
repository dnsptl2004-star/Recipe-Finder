param(
  [switch]$ApplyChanges
)
Write-Host "=== Vercel diagnosis script (auto-run) ===" -ForegroundColor Cyan

$cwd = (Get-Location).Path
Write-Host "`nWorking directory: $cwd" -ForegroundColor DarkCyan

# Helpers
function FindFiles([string[]]$globs) {
  $files = @()
  foreach ($g in $globs) {
    $files += Get-ChildItem -Path $cwd -Recurse -Include $g -File -ErrorAction SilentlyContinue
  }
  return $files | Select-Object -Unique
}

# 1) Find runtime='edge'
Write-Host "`n[1/5] Searching for Edge runtime declarations..."
$searchFiles = FindFiles @('*.js','*.ts','*.jsx','*.tsx')
$edgeMatches = @()
foreach ($f in $searchFiles) {
  try {
    $matches = Select-String -Path $f.FullName -Pattern "export\s+const\s+runtime\s*=\s*['""]edge['""]" -SimpleMatch -ErrorAction SilentlyContinue
    if ($matches) { $edgeMatches += $matches }
  } catch {}
}
if ($edgeMatches.Count -gt 0) {
  Write-Host "Found Edge runtime declarations in these files:" -ForegroundColor Yellow
  $edgeMatches | ForEach-Object { Write-Host " - $($_.Path) : line $($_.LineNumber) -> $($_.Line.Trim())" }
} else {
  Write-Host "No Edge runtime declarations found."
}

# 2) Find potentially heavy/native modules imported at top-level
Write-Host "`n[2/5] Searching for potentially problematic top-level imports (opencv, mediapipe, sharp, tensorflow, node-gyp modules, etc.)..."
$heavyPatterns = @("opencv","opencv4nodejs","opencv.js","mediapipe","cv2","sharp","node-gyp","tensorflow","@tensorflow","child_process","ffi-napi","ffi")
$heavyRegex = ($heavyPatterns -join "|")
$heavyMatches = @()
foreach ($f in $searchFiles) {
  try {
    $m = Select-String -Path $f.FullName -Pattern $heavyRegex -CaseSensitive:$false -ErrorAction SilentlyContinue
    if ($m) { $heavyMatches += $m }
  } catch {}
}
if ($heavyMatches.Count -gt 0) {
  Write-Host "Warning: These files reference heavy/native modules or Node-only APIs. Review for serverless suitability:" -ForegroundColor Red
  $heavyMatches | Select-Object Path, LineNumber, Line -Unique | ForEach-Object { Write-Host " - $($_.Path) (line $($_.LineNumber)) : $($_.Line.Trim())" }
} else {
  Write-Host "No obvious heavy/native imports detected by pattern list."
}

# 3) Find Node-only API usage (child_process, net, dgram)
Write-Host "`n[3/5] Searching for Node-only API usage patterns (child_process, net, dgram)..."
$nodeApiPatterns = "child_process|net\W|dgram\W|cluster\W"
$nodeApiMatches = @()
foreach ($f in $searchFiles) {
  try {
    $m = Select-String -Path $f.FullName -Pattern $nodeApiPatterns -CaseSensitive:$false -ErrorAction SilentlyContinue
    if ($m) { $nodeApiMatches += $m }
  } catch {}
}
if ($nodeApiMatches.Count -gt 0) {
  Write-Host "Found Node-specific APIs used in these files (Edge runtime incompatible):" -ForegroundColor Yellow
  $nodeApiMatches | Select-Object Path, LineNumber, Line -Unique | ForEach-Object { Write-Host " - $($_.Path) (line $($_.LineNumber)) : $($_.Line.Trim())" }
} else {
  Write-Host "No Node-only API usage found by quick scan."
}

# 4) Find uses of process.env
Write-Host "`n[4/5] Scanning for process.env occurrences (may indicate env accessed at import/cold-start)..."
$envMatches = @()
foreach ($f in $searchFiles) {
  try {
    $m = Select-String -Path $f.FullName -Pattern "process\.env\.[A-Za-z0-9_]+" -CaseSensitive:$false -ErrorAction SilentlyContinue
    if ($m) { $envMatches += $m }
  } catch {}
}
if ($envMatches.Count -gt 0) {
  Write-Host "Files referencing process.env (inspect for top-level usage):"
  $envMatches | Select-Object Path, LineNumber, Line -Unique | ForEach-Object { Write-Host " - $($_.Path) (line $($_.LineNumber)) : $($_.Line.Trim())" }
} else {
  Write-Host "No process.env usage found by quick scan."
}

# 5) Optionally replace Edge runtime declarations
$patchedFiles = @()
if ($ApplyChanges -and $edgeMatches.Count -gt 0) {
  Write-Host "`n[5/5] Applying changes to replace Edge runtime declarations with Node runtime..." -ForegroundColor Green
  $handled = @()
  foreach ($m in $edgeMatches) {
    $file = $m.Path
    if ($handled -contains $file) { continue }
    try {
      $content = Get-Content -Raw -LiteralPath $file -ErrorAction Stop
      $new = [regex]::Replace($content, "export\s+const\s+runtime\s*=\s*(['""]?)edge\1", "export const runtime = 'nodejs'", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      if ($new -ne $content) {
        Copy-Item -Path $file -Destination ($file + ".bak") -Force
        Set-Content -LiteralPath $file -Value $new -Force
        Write-Host "Patched: $file  (backup created: $file.bak)" -ForegroundColor Green
        $patchedFiles += $file
      } else {
        Write-Host "No replacement occurred for $file"
      }
    } catch {
      Write-Host "Failed to patch $file : $_" -ForegroundColor Red
    }
    $handled += $file
  }
} elseif ($ApplyChanges) {
  Write-Host "`nNo Edge runtime declarations found to apply changes to."
} else {
  Write-Host "`nRun with -ApplyChanges to automatically replace Edge runtime declarations with Node runtime where found."
}

# Print summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Edge runtime files found: $($edgeMatches.Count)"
Write-Host "Heavy/native import hits: $($heavyMatches.Count)"
Write-Host "Node API hits: $($nodeApiMatches.Count)"
Write-Host "process.env occurrences: $($envMatches.Count)"
Write-Host "Files patched: $($patchedFiles.Count)"

# If patched files present, show first 20 lines of each patched file for review
if ($patchedFiles.Count -gt 0) {
  Write-Host "`n--- Showing first 20 lines of each patched file ---" -ForegroundColor Magenta
  foreach ($pf in $patchedFiles) {
    Write-Host "`n>>> $pf" -ForegroundColor Magenta
    try {
      Get-Content -Path $pf -TotalCount 20 | ForEach-Object { Write-Host $_ }
    } catch {
      Write-Host "Unable to read $pf : $_" -ForegroundColor Red
    }
  }
  Write-Host "`nBackups were created alongside each patched file with a .bak extension. To revert, rename the .bak back to the original name." -ForegroundColor Yellow
}

Write-Host "`n=== Done ==="
