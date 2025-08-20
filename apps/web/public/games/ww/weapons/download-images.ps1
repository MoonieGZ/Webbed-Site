# Script: Download-WeaponImages.ps1
# Place in the directory with your *-images.txt files

# Get all text files matching *-images.txt
Get-ChildItem -Filter "*-images.txt" | ForEach-Object {
    $file = $_.FullName
    $weaponType = $_.BaseName -replace "-images$",""

    # Create folder for this weapon type if not exists
    $outDir = Join-Path $PSScriptRoot $weaponType
    if (!(Test-Path $outDir)) {
        New-Item -ItemType Directory -Path $outDir | Out-Null
    }

    # Read each URL from the file
    Get-Content $file | ForEach-Object {
        $url = $_.Trim()
        if ($url) {
            try {
                $fileName = Split-Path $url -Leaf
                $outPath = Join-Path $outDir $fileName
                Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing
                Write-Host "Downloaded $url -> $outPath"
            } catch {
                Write-Warning "Failed to download $url"
            }
        }
    }
}
