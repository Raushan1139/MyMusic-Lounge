$headers = @{"Content-Type" = "application/json"}
$resp = Invoke-WebRequest -Uri "http://localhost:5000/api/playlists?limit=50" -Headers $headers -UseBasicParsing
$playlists = ($resp.Content | ConvertFrom-Json).playlists
$old = $playlists | Where-Object { $_.name -eq "Old Song" }
Write-Host "Old Song track count: $($old.tracks.Count)"
foreach ($t in $old.tracks) {
    Write-Host "  - $t"
}
