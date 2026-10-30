# PowerShell script to add extra Old Song tracks via the running API
$base = "http://localhost:5000"

# 1. Login and get token
$loginBody = @{
  email = "admin@mymusiclounge.com"
  password = "AdminLounge2026!"
} | ConvertTo-Json

$loginResp = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
$token = ($loginResp.Content | ConvertFrom-Json).token
Write-Host "Got token: $($token.Substring(0, 20))..."

$headers = @{ Authorization = "Bearer $token" }

# 2. Get Old Song playlist
$playlistsResp = Invoke-WebRequest -Uri "$base/api/playlists" -Headers $headers -UseBasicParsing
$playlists = ($playlistsResp.Content | ConvertFrom-Json).playlists
$oldSongPlaylist = $playlists | Where-Object { $_.name -eq "Old Song" }
if (-not $oldSongPlaylist) {
  Write-Host "ERROR: Old Song playlist not found!"
  exit 1
}
$playlistId = $oldSongPlaylist._id
Write-Host "Found Old Song playlist ID: $playlistId with $($oldSongPlaylist.tracks.Count) tracks"

# 3. Songs to add
$songs = @(
  @{ title="Mera Dil Bhi Kitna Pagal Hai"; artist="Kumar Sanu & Alka Yagnik"; album="Saajan"; providerVideoId="EzNA5JAoOdX"; durationSeconds=355 },
  @{ title="Dil Hai Ki Manta Nahin"; artist="Kumar Sanu & Anuradha Paudwal"; album="Dil Hai Ki Manta Nahin"; providerVideoId="Zl038lvkkk0"; durationSeconds=340 },
  @{ title="Chura Ke Dil Mera"; artist="Kumar Sanu & Alka Yagnik"; album="Main Khiladi Tu Anari"; providerVideoId="kDqK8xnfMwY"; durationSeconds=325 },
  @{ title="Tu Meri Zindagi Hai"; artist="Kumar Sanu & Anuradha Paudwal"; album="Aashiqui"; providerVideoId="C3d51OtZAMM"; durationSeconds=310 },
  @{ title="Nazar Ke Samne Jigar Ke Paas"; artist="Kumar Sanu & Anuradha Paudwal"; album="Aashiqui"; providerVideoId="9RxRCx6rEJk"; durationSeconds=295 },
  @{ title="Baazigar O Baazigar"; artist="Kumar Sanu & Alka Yagnik"; album="Baazigar"; providerVideoId="PUO7_Gi6ipg"; durationSeconds=315 },
  @{ title="Kitna Haseen Chehra"; artist="Kumar Sanu & Alka Yagnik"; album="Dilwale"; providerVideoId="gf7yFyDdSX4"; durationSeconds=330 },
  @{ title="Pehla Pehla Pyar Hai"; artist="Kumar Sanu & Kavita Krishnamurthy"; album="Hum Aapke Hain Koun"; providerVideoId="h1hKK8nk2eU"; durationSeconds=305 },
  @{ title="Jeeye To Jeeye Kaise"; artist="Kumar Sanu & Anuradha Paudwal"; album="Saajan"; providerVideoId="XOxz0Hr3Hzo"; durationSeconds=345 },
  @{ title="Ek Ladki Ko Dekha Toh Aisa Laga"; artist="Kumar Sanu"; album="1942: A Love Story"; providerVideoId="R9KFZ0ObMzE"; durationSeconds=290 },
  @{ title="Tujhko Dekha To Yeh Jana Sanam"; artist="Lata Mangeshkar & Kumar Sanu"; album="Dilwale Dulhania Le Jayenge"; providerVideoId="fM0zCyBGdmU"; durationSeconds=310 },
  @{ title="Kuch Kuch Hota Hai"; artist="Udit Narayan & Kavita Krishnamurthy"; album="Kuch Kuch Hota Hai"; providerVideoId="GWPLAb90iOI"; durationSeconds=360 },
  @{ title="Aaye Ho Meri Zindagi Mein"; artist="Udit Narayan & Kavita Krishnamurthy"; album="Raja Hindustani"; providerVideoId="JwDMc-GSMAA"; durationSeconds=320 },
  @{ title="Yeh Kaali Kaali Aankhein"; artist="Kumar Sanu & Sadhna Sargam"; album="Baazigar"; providerVideoId="yzYnEuq9J34"; durationSeconds=300 },
  @{ title="Hum Tere Bin Kahin Reh Nahin Sakte"; artist="Kumar Sanu & Alka Yagnik"; album="Baazigar"; providerVideoId="sHE8TIciqtM"; durationSeconds=335 },
  @{ title="Tera Mera Pyar Amar"; artist="Kumar Sanu & Alka Yagnik"; album="Assi Nabbe Poore Sau"; providerVideoId="kBmqGa3pxMQ"; durationSeconds=315 },
  @{ title="Tumse Milna Batein Karna"; artist="Kumar Sanu & Alka Yagnik"; album="Prem Qaidi"; providerVideoId="y0PtZRcPpik"; durationSeconds=285 },
  @{ title="Pyar Itna Mat Karo"; artist="Kumar Sanu & Anuradha Paudwal"; album="Sangram"; providerVideoId="ZiO3fZwxsKA"; durationSeconds=340 },
  @{ title="Main Koi Aisa Geet Gaoon"; artist="Kumar Sanu"; album="Yes Boss"; providerVideoId="g6t-YKxMiEY"; durationSeconds=295 },
  @{ title="O Sanam"; artist="Lucky Ali"; album="Sunoh"; providerVideoId="vvhpJJBpFUk"; durationSeconds=280 }
)

$addedCount = 0
$skippedCount = 0

foreach ($song in $songs) {
  # Check if track exists by fetching all tracks and searching
  $trackSearchResp = Invoke-WebRequest -Uri "$base/api/tracks?limit=200" -Headers $headers -UseBasicParsing
  $allTracks = ($trackSearchResp.Content | ConvertFrom-Json).tracks
  $existing = $allTracks | Where-Object { $_.providerVideoId -eq $song.providerVideoId }

  if ($existing) {
    $trackId = $existing._id
    Write-Host "Track exists: $($song.title) (id: $trackId)"
  } else {
    # Create track via admin API
    $trackBody = @{
      title = $song.title
      artist = $song.artist
      album = $song.album
      provider = "youtube"
      providerVideoId = $song.providerVideoId
      thumbnailUrl = "https://i.ytimg.com/vi/$($song.providerVideoId)/hqdefault.jpg"
      durationSeconds = $song.durationSeconds
      isPublished = $true
    } | ConvertTo-Json

    $createResp = Invoke-WebRequest -Uri "$base/api/admin/tracks" -Method POST -Headers $headers -Body $trackBody -ContentType "application/json" -UseBasicParsing
    $trackId = ($createResp.Content | ConvertFrom-Json)._id
    Write-Host "Created track: $($song.title) (id: $trackId)"
  }

  # Add to playlist
  $addBody = @{ trackId = $trackId } | ConvertTo-Json
  try {
    $addResp = Invoke-WebRequest -Uri "$base/api/playlists/$playlistId/tracks" -Method POST -Headers $headers -Body $addBody -ContentType "application/json" -UseBasicParsing
    $addedCount++
    Write-Host "  -> Added to Old Song playlist"
  } catch {
    $skippedCount++
    Write-Host "  -> Already in playlist or error: $($_.Exception.Message)"
  }
}

Write-Host ""
Write-Host "Done! Added: $addedCount | Skipped/Errors: $skippedCount"
