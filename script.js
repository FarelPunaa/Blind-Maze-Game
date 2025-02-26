let username = ''
let stage = 1
let nyawa = 3
let waktu = 7
let kesempatan = 1
let waktuMain = 14
let pengingat = true
let dinding = []
let maze = []
let player = 0
let timer = true
let statusPLayer = false
let dataLeaderboard = JSON.parse(localStorage.getItem('leaderboard')) || []

window.onload = function(){
    document.getElementById("landingPage").style.display = "flex"
    document.getElementById("gamePage").style.display = "none"
}

document.getElementById("username").addEventListener("input", function(){
    username = document.getElementById("username").value
    document.getElementById("btnPlay").disabled = !username
})

document.getElementById("btnPlay").addEventListener("click", function(){
    nyawa = 3
    stage = 1
    waktu = 7
    kesempatan = 1
    statusPLayer = false


    document.getElementById("waktu").textContent = `Timer ${waktu}`
    document.getElementById("nyawa").textContent = `Lives ${nyawa}`
    document.getElementById("stage").textContent = `Stage ${stage}`
    document.getElementById("kesempatan").textContent = `Chance ${kesempatan}`

    document.getElementById("landingPage").style.display = "none"

    document.getElementById("gamePage").style.display = "block"
    document.getElementById("gamePage").style.display = "flex"
    document.getElementById("gamePage").style.visibility = "visible"

    buatMaze()
    persiapan()
})

function buatMaze() {
    const grid = document.getElementById("maze")
    grid.innerHTML = ''
    dinding = []
    maze = []

    for (let i = 0; i < 49; i++) {
        const block = document.createElement("div")
        block.classList.add("block")
        grid.appendChild(block)
        maze.push(block)
    }

    const playerRow = Math.floor(Math.random() * 7)
    const posisiPlayer = playerRow * 7
    maze[posisiPlayer].classList.add("player")
    player = posisiPlayer

    const finishRow = Math.floor(Math.random() * 7)
    const finishPosisi = finishRow * 7 + 6
    maze[finishPosisi].classList.add("finish")

    // Fungsi untuk mengecek apakah ada jalur dari player ke finish
    function isPathAvailable() {
        let queue = [posisiPlayer]
        let visited = new Set()
        visited.add(posisiPlayer)

        while (queue.length > 0) {
            let current = queue.shift()

            if (current === finishPosisi) {
                return true // Ada jalur ke finish
            }

            let neighbors = [
                current - 7, // Atas
                current + 7, // Bawah
                current - 1, // Kiri
                current + 1  // Kanan
            ]

            for (let neighbor of neighbors) {
                if (neighbor >= 0 && neighbor < 49 && // Pastikan dalam batas grid
                    !dinding.includes(neighbor) && // Bukan dinding
                    !visited.has(neighbor) && // Belum dikunjungi
                    !(current % 7 === 0 && neighbor === current - 1) && // Cegah looping ke kiri dari batas kiri
                    !((current + 1) % 7 === 0 && neighbor === current + 1) // Cegah looping ke kanan dari batas kanan
                ) {
                    queue.push(neighbor)
                    visited.add(neighbor)
                }
            }
        }

        return false // Tidak ada jalur ke finish
    }

    // Tempatkan dinding secara acak hingga ada jalur yang valid
    let wall
    do {
        dinding = []
        wall = new Set()
        while (wall.size < 14) {
            let random = Math.floor(Math.random() * 49)
            if (!wall.has(random) && random !== posisiPlayer && random !== finishPosisi) {
                wall.add(random)
            }
        }
        dinding = Array.from(wall)
    } while (!isPathAvailable()) // Ulangi jika tidak ada jalur

    // Tambahkan class wall ke blok yang dipilih
    dinding.forEach(index => {
        maze[index].classList.add("wall")
    })
}


function persiapan(){
    let waktuSisa = waktu
    document.getElementById("waktu").textContent = `Countdown ${waktuSisa}`
    pengingat = true
    document.getElementById("btnHint").disabled = true
    clearInterval(timer)
    timer = setInterval(function(){
        if(waktuSisa <= 0){
            pengingat = false
            clearInterval(timer)
            hilangkanDinding()
            aktifkanBtn()
            mulaiMain()
        }else{
            waktuSisa--
            document.getElementById("waktu").textContent = `Countdown ${waktuSisa}`
        }
    }, 1000)
}

function hilangkanDinding(){
    const block = document.querySelectorAll(".block")
    block.forEach(block=>{
        if(block.classList.remove("wall")){
            block.classList.contains("Wall")
        }
    })
}

function aktifkanBtn(){
    document.getElementById("btnHint").disabled = false
}

function mulaiMain(){
    let waktuSisa = waktuMain
    document.getElementById("waktu").textContent = `Timer ${waktuSisa}`
    clearInterval(timer)
    timer = setInterval(function(){
        if(waktuSisa <= 0){
            alert("waktu habis")
            clearInterval(timer)
            nyawa--
            document.getElementById("nyawa").textContent = `Lives ${nyawa}`
            if(nyawa > 0){
                resetStage()
            }else(
                gameOver()
            )
        }else{
            waktuSisa--
            document.getElementById("waktu").textContent = `Timer ${waktuSisa}`
        }
    }, 1000)
}

document.getElementById("btnHint").addEventListener("click", function(){
    if(kesempatan > 0){
        document.querySelectorAll(".block").forEach((block, index) => {
            if(dinding.includes(index)){
                block.classList.add("wall")
            }
        })
        setTimeout(hilangkanDinding, 1000)
        kesempatan = 0
        document.getElementById("kesempatan").textContent = `Chance ${kesempatan}`
        document.getElementById("btnHint").disabled = true
    } else {
        alert("Kesempatan habis")
    }
})

function gameOver(){
    clearInterval(timer)
    statusPLayer = true

    document.getElementById("gameoverPage").style.display = "flex"
   
    document.getElementById("usernameDisplay").textContent = `Username : ${username}`
   
    const finalStage = document.getElementById("score")
    finalStage.textContent = `Score : ${stage}`
    
}

function resetStage(){
    alert("stage restarted")
    buatMaze()
    persiapan()
}

document.addEventListener("keydown", function(event){
    if(statusPLayer) return
    const activeElement = document.activeElement

    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)){
        event.preventDefault
    }

    if(pengingat) return

    if(event.key === "ArrowUp" && player - 7 >= 0){
        player-= 7
    }else if(event.key === "ArrowDown" && player + 7 < 49){
        player+= 7
    }else if(event.key === "ArrowLeft" && player % 7 !== 0){
        player--
    }else if(event.key === "ArrowRight" && player % 7 !== 6){
        player++
    }

    gerak()
    hitDinding()
})

function gerak(){
    const block = document.querySelectorAll(".block")
    block.forEach(block => block.classList.remove("player"))
    maze[player].classList.add("player")
}

function hitDinding(){
    const block = document.querySelectorAll(".block")
    if(!pengingat && dinding.includes(player)){
        const playerBlock = block[player]
        playerBlock.classList.add("hit")
        setTimeout(function(){
            playerBlock.classList.remove("hit")
            alert("you hit obstacle")
            nyawa--
            document.getElementById("nyawa").textContent = `Lives ${nyawa}`
            if(nyawa <= 0 ){
                gameOver()
            }else{
                resetStage()
            }
        }, 100)
    }else if(block[player].classList.contains("finish")){
        document.getElementById("nextPage").style.display = "flex"
        clearInterval(timer)
        statusPLayer = true
    }
}

document.getElementById("nextStage").addEventListener("click", function(){
    document.getElementById("nextPage").style.display = "none"
    stage++
    document.getElementById("stage").textContent = `Stage ${stage}`
    kesempatan = 1
    document.getElementById("kesempatan").textContent = `Chance ${kesempatan}`

    buatMaze()
    persiapan()
    statusPLayer = false
})

document.getElementById("keluarNext").addEventListener("click", function(){
    simpanDataLeaderboard()
    clearInterval(timer)
    username = ''
    document.getElementById("username").value = ''
    document.getElementById("gamePage").style.display = "none"
    document.getElementById("nextPage").style.display = "none"
    document.getElementById("landingPage").style.display = "flex"
    document.getElementById("btnPlay").disabled = true
    statusPLayer = true


})

document.getElementById("keluarGameOver").addEventListener("click", function(){
    simpanDataLeaderboard()

    clearInterval(timer)
    username = ''
    document.getElementById("username").value = ''

    document.getElementById("gamePage").style.display = "none"
    document.getElementById("gameoverPage").style.display = "none"
    document.getElementById("landingPage").style.display = "flex"

    document.getElementById("btnPlay").disabled = true
    statusPLayer = true
})


document.getElementById("btnKeluarGame").addEventListener("click", function(){
    simpanDataLeaderboard()
    clearInterval(timer)
    username = ''
    document.getElementById("username").value = ''

    document.getElementById("gamePage").style.display = "none"
    document.getElementById("landingPage").style.display = "flex"
    document.getElementById("btnPlay").disabled = true
    statusPLayer = true

})

document.getElementById("btnTutorial").addEventListener("click", function(){
    document.getElementById("tutorialModal").style.display = "flex"
})

document.getElementById("closeModal").addEventListener("click", function(){
    document.getElementById("tutorialModal").style.display = "none"
})
document.getElementById("closeModalL").addEventListener("click", function(){
    document.getElementById("leaderboardModal").style.display = "none"
})

document.getElementById("btnLeaderboard").addEventListener("click", function(){
    tampilkanLeaderboard()

    document.getElementById("leaderboardModal").style.display = "flex"
})

function simpanDataLeaderboard(){
    const playerData = {
        username : username,
        stage : stage
    }

    dataLeaderboard.push(playerData)
    dataLeaderboard.sort((a,b) => b.stage - a.stage)
    localStorage.setItem('leaderboard', JSON.stringify(dataLeaderboard))
}

function tampilkanLeaderboard(){
    const modal = document.getElementById("leaderboardModal")
    const list = document.getElementById("list")
    list.innerHTML = ''

    dataLeaderboard.forEach(player=> {
        const li = document.createElement("li")
        li.className = "list"
        li.innerHTML = `Username: ${player.username} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Stage: ${player.stage}`;

        
    list.appendChild(li)

    })

}