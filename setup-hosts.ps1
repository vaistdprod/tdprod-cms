# Run this script as Administrator to add the test domains to your hosts file
$hostsPath = "$env:windir\System32\drivers\etc\hosts"
$domains = @(
    "127.0.0.1 drsarah.test",
    "127.0.0.1 pediatric-clinic.test",
    "127.0.0.1 pedicare.local"
)

# Check if entries already exist
$currentHosts = Get-Content $hostsPath
$newEntries = $domains | Where-Object { $currentHosts -notcontains $_ }

if ($newEntries.Count -gt 0) {
    # Add new entries to hosts file
    $newEntries | Add-Content $hostsPath -Force
    Write-Host "Added the following entries to your hosts file:"
    $newEntries | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "All required domains are already in your hosts file."
}

Write-Host "`nYou can now access the sites at:"
Write-Host "http://drsarah.test:3000"
Write-Host "http://pediatric-clinic.test:3000"
Write-Host "http://pedicare.local:3000"
