# PowerShell script to seed Old Song tracks using youtubeUrl approach
$base = "http://localhost:5000"

# 1. Login
$loginHeaders = @{"Content-Type" = "application/json"}
$loginBody = '{"identifier":"admin@mymusiclounge.com","password":"AdminLounge2026!"}'
$loginResp = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Headers $loginHeaders -Body $loginBody -UseBasicParsing
$token = ($loginResp.Content | ConvertFrom-Json).token
Write-Host "Logged in. Token: $($token.Substring(0,25))..."

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Get Old Song playlist ID
$playlistsResp = Invoke-WebRequest -Uri "$base/api/playlists?limit=50" -Headers $headers -UseBasicParsing
$playlists = ($playlistsResp.Content | ConvertFrom-Json).playlists
$oldSong = $playlists | Where-Object { $_.name -eq "Old Song" }
$playlistId = $oldSong._id
Write-Host "Old Song playlist ID: $playlistId, current tracks: $($oldSong.tracks.Count)"

# 3. Songs (videoId, title, artist for creating via youtubeUrl)
$songs = @(
    @{title="Mera Dil Bhi Kitna Pagal Hai";artist="Kumar Sanu & Alka Yagnik";album="Saajan";videoId="EzNA5JAoOdX"},
    @{title="Dil Hai Ki Manta Nahin";artist="Kumar Sanu & Anuradha Paudwal";album="Dil Hai Ki Manta Nahin";videoId="Zl038lvkkk0"},
    @{title="Chura Ke Dil Mera";artist="Kumar Sanu & Alka Yagnik";album="Main Khiladi Tu Anari";videoId="kDqK8xnfMwY"},
    @{title="Tu Meri Zindagi Hai";artist="Kumar Sanu & Anuradha Paudwal";album="Aashiqui";videoId="C3d51OtZAMM"},
    @{title="Nazar Ke Samne Jigar Ke Paas";artist="Kumar Sanu & Anuradha Paudwal";album="Aashiqui";videoId="9RxRCx6rEJk"},
    @{title="Baazigar O Baazigar";artist="Kumar Sanu & Alka Yagnik";album="Baazigar";videoId="PUO7_Gi6ipg"},
    @{title="Kitna Haseen Chehra";artist="Kumar Sanu & Alka Yagnik";album="Dilwale";videoId="gf7yFyDdSX4"},
    @{title="Pehla Pehla Pyar Hai";artist="Kumar Sanu & Kavita Krishnamurthy";album="Hum Aapke Hain Koun";videoId="h1hKK8nk2eU"},
    @{title="Jeeye To Jeeye Kaise";artist="Kumar Sanu & Anuradha Paudwal";album="Saajan";videoId="XOxz0Hr3Hzo"},
    @{title="Ek Ladki Ko Dekha Toh Aisa Laga";artist="Kumar Sanu";album="1942: A Love Story";videoId="R9KFZ0ObMzE"},
    @{title="Tujhko Dekha To Yeh Jana Sanam";artist="Lata Mangeshkar & Kumar Sanu";album="Dilwale Dulhania Le Jayenge";videoId="fM0zCyBGdmU"},
    @{title="Kuch Kuch Hota Hai";artist="Udit Narayan & Kavita Krishnamurthy";album="Kuch Kuch Hota Hai";videoId="GWPLAb90iOI"},
    @{title="Aaye Ho Meri Zindagi Mein";artist="Udit Narayan & Kavita Krishnamurthy";album="Raja Hindustani";videoId="JwDMc-GSMAA"},
    @{title="Yeh Kaali Kaali Aankhein";artist="Kumar Sanu & Sadhna Sargam";album="Baazigar";videoId="yzYnEuq9J34"},
    @{title="Hum Tere Bin Kahin Reh Nahin Sakte";artist="Kumar Sanu & Alka Yagnik";album="Baazigar";videoId="sHE8TIciqtM"},
    @{title="Tera Mera Pyar Amar";artist="Kumar Sanu & Alka Yagnik";album="Assi Nabbe Poore Sau";videoId="kBmqGa3pxMQ"},
    @{title="Tumse Milna Batein Karna";artist="Kumar Sanu & Alka Yagnik";album="Prem Qaidi";videoId="y0PtZRcPpik"},
    @{title="Pyar Itna Mat Karo";artist="Kumar Sanu & Anuradha Paudwal";album="Sangram";videoId="ZiO3fZwxsKA"},
    @{title="Main Koi Aisa Geet Gaoon";artist="Kumar Sanu";album="Yes Boss";videoId="g6t-YKxMiEY"},
    @{title="O Sanam";artist="Lucky Ali";album="Sunoh";videoId="vvhpJJBpFUk"}
)

$added = 0
$skipped = 0

foreach ($song in $songs) {
    $youtubeUrl = "https://www.youtube.com/watch?v=$($song.videoId)"
    
    # Use youtubeUrl mode + title/artist for auto-create-and-add
    $addBody = @{
        youtubeUrl = $youtubeUrl
        title = $song.title
        artist = $song.artist
    } | ConvertTo-Json
    
    try {
        $addResp = Invoke-WebRequest -Uri "$base/api/playlists/$playlistId/tracks" -Method POST -Headers $headers -Body $addBody -UseBasicParsing
        $respJson = $addResp.Content | ConvertFrom-Json
        Write-Host "ADDED: $($song.title) => $($respJson.message)"
        $added++
    } catch {
        $errMsg = $_.Exception.Message
        if ($errMsg -match "409|already") {
            Write-Host "SKIP (duplicate): $($song.title)"
            $skipped++
        } else {
            Write-Host "ERROR: $($song.title) - $errMsg"
            $skipped++
        }
    }
}

Write-Host ""
Write-Host "=== DONE === Added: $added | Skipped/Errors: $skipped"

# 4. Show final count
$finalResp = Invoke-WebRequest -Uri "$base/api/playlists/$playlistId" -Headers $headers -UseBasicParsing
$finalPlaylist = ($finalResp.Content | ConvertFrom-Json).playlist
Write-Host "Old Song now has $($finalPlaylist.tracks.Count) tracks total"
