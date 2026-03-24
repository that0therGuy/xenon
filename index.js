let inventory= new Object()
let filename='hello.txt'
let id = 0;

// ── GG.deals API key ──────────────────────────────────────────────────────────
// Get a free key at https://gg.deals/api/ (personal/hobby use is free)
const GG_DEALS_API_KEY = 'SiDijFD5OmudA7TaT0QxQrvvmPm8f24l';

async function read(){
    try {
        let blob = await puter.fs.read(filename);
        let content = await blob.text();

        inventory = content ? JSON.parse(content) : {};
    } catch (e) {
        inventory = {};
    }

    render();

    id = Math.max(
        0,
        ...Object.keys(inventory).map(k => Number(k.replace('item','')))
    );
}

let game_select = document.querySelector('#game')
let dlc_select = document.querySelector('#dlc')
let ul=             document.querySelector('ul')


document.querySelector('.key_input').addEventListener('dblclick',()=>{
    if (document.querySelector('.key_input').type==='text'){
        document.querySelector('.key_input').type='password'
    }else{
        document.querySelector('.key_input').type='text'
    }
})
document.querySelector('.add_button').addEventListener('click', () => {
    id++
    let content= document.querySelector('.add_input').value;
    let key_content= document.querySelector('.key_input').value;


    inventory[`item${id}`]={
        game:null,
        key:null,
        type:null
    }

    inventory[`item${id}`]['game']= content
    inventory[`item${id}`]['key']= key_content

    if (game_select.classList.contains('selected_type')) {
        inventory[`item${id}`]['type']= 'game'

    }
    else if(dlc_select.classList.contains('selected_type')) {
        inventory[`item${id}`]['type']= 'dlc'

    }
    puter.fs.write('hello.txt', JSON.stringify(inventory)).then(() => {
        console.log(inventory)
    })

    render()
})
game_select.addEventListener('click', () => {

    game_select.classList.add('selected_type')
    dlc_select.classList.remove('selected_type')


})
dlc_select.addEventListener('click', () => {
    dlc_select.classList.add('selected_type')
    game_select.classList.remove('selected_type')


})


function render(){
    ul.innerHTML=``
    for (const item in inventory){
        let currentkey= item
        let data= inventory[currentkey]
        let div = document.createElement('div')
        div.classList.add('li_div')

        let game = document.createElement('li')
        game.classList.add('game_item')
        game.innerText=data.game
        game.addEventListener('dblclick', ()=>{
            let name= prompt('new name? ')
            data.game=name
            puter.fs.write('hello.txt', JSON.stringify(inventory)).then(() => {
                console.log(inventory)
            })
            render()


        })
        div.addEventListener('mouseover', function(){
            let game_name = game.innerText
            let url = `https://corsproxy.io/?https://store.steampowered.com/api/storesearch/?term=${game_name}&l=english&cc=US`

            // Show a loading state immediately
            let right = document.querySelector('.rightcontent')
            right.innerHTML = `<p style="opacity:0.5">Loading ${game_name}…</p>`

            fetch(url)
                .then(r => r.text())
                .then(html => {
                    let info = JSON.parse(html).items[0]
                    if (!info) {
                        right.innerHTML = `<p style="opacity:0.5">No results found for "${game_name}"</p>`
                        return
                    }
                    // Show Steam info first, then fetch GG.deals prices
                    info_show(info)
                    fetch_ggdeals_prices(info.id)
                })
                .catch(error => {
                    console.log(error)
                    right.innerHTML = `<p style="opacity:0.5">Error loading info.</p>`
                })
        })


        if (data.type === 'game'){
            game.classList.add('game')
        }
        else if (data.type === 'dlc'){
            game.classList.add('dlc')
        }

        let key = document.createElement('input')
        key.classList.add('key_el')
        key.value=data.key
        key.readOnly=true
        key.addEventListener('dblclick',()=>{
            if (key.type==='text'){
                key.type='password'
            }else{
                key.type='text'
            }
        })
        key.type='password'
        let img= document.createElement('img')
        img.src='delete.png'

        img.addEventListener('click', ()=>{
            let dec= prompt('are you sure? (y/n)')
            if (dec === 'y'){
                delete inventory[currentkey]
                puter.fs.write('hello.txt', JSON.stringify(inventory)).then(() => {
                    console.log(inventory)
                })
                render()
            }

        })


        div.appendChild(game)
        div.appendChild(key)
        div.appendChild(img)
        ul.appendChild(div)
    }
}
document.querySelector('.master_delete').addEventListener('click',()=>{
    let dec= prompt('are you sure? (y/n)')
    if (dec === 'y'){
        inventory={}
        puter.fs.write('hello.txt', JSON.stringify(inventory)).then(() => {
            console.log(inventory)
        })
        render()
    }

})

read()



function info_show(info){
    console.log(info)

    let right= document.querySelector('.rightcontent')
    right.innerHTML=`
<img src="${info.tiny_image}">
<h2>${info.name}</h2>
<br>
<i>Steam ID: ${info.id}</i>
<a style='text-decoration: underline;' href="https://store.steampowered.com/app/${info.id}/" target="_blank">Steam Store Page</a>
<br><br>
<div id="ggdeals-prices">
  <span style="opacity:0.5; font-size:0.85em">Fetching GG.deals prices…</span>
</div>
    `
}

async function fetch_ggdeals_prices(steamAppId) {
    const pricesDiv = document.getElementById('ggdeals-prices')
    if (!pricesDiv) return

    if (!GG_DEALS_API_KEY || GG_DEALS_API_KEY === 'YOUR_GG_DEALS_API_KEY') {
        pricesDiv.innerHTML = `
            <div class="ggdeals-block">
              <span style="opacity:0.6; font-size:0.8em">
                ⚠️ Add your <a href="https://gg.deals/api/" target="_blank" style="text-decoration:underline">GG.deals API key</a> to index.js to see prices.
              </span>
            </div>`
        return
    }

    try {
        const target = `https://api.gg.deals/v1/prices/by-steam-app-id/?ids=${steamAppId}&key=${GG_DEALS_API_KEY}&region=us`
        const url = `https://corsproxy.io/?url=${encodeURIComponent(target)}`
        const response = await fetch(url)
        const json = await response.json()

        const gameData = json?.data?.[String(steamAppId)] ?? Object.values(json?.data ?? {})[0]

        if (!gameData) {
            pricesDiv.innerHTML = `<span style="opacity:0.5; font-size:0.85em">No GG.deals data found.</span>`
            return
        }

        const p = gameData.prices
        const currency = p.currency

        // Build a clean price table
        pricesDiv.innerHTML = `

            <div class="ggdeals-block">
              <div class="block">
               <h1>Official Price: </h1>
               <h1>${p.currentRetail} USD</h1>

               </div>
               <div class="block">
               <h1>Lowest Keyshop Price: </h1>
               <h1>${p.currentKeyshops} USD</h1>
</div>
              
            </div>

`
    } catch (err) {
        console.error('GG.deals fetch error:', err)
        pricesDiv.innerHTML = `<span style="opacity:0.5; font-size:0.85em">Could not load GG.deals prices.</span>`
    }
}