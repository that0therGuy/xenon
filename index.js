let inventory= new Object()
let filename='hello.txt'
let id;


async function read(){
    let blob = await puter.fs.read(filename);
    let content = await blob.text();
    inventory= JSON.parse(content)
    render()
    id = Math.max(
        0,
        ...Object.keys(inventory).map(k => Number(k.replace('item','')))
    )
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
        div.addEventListener('mouseover',function(){
            let game_name=game.innerText
            let info={};

            let url=`https://corsproxy.io/?https://store.steampowered.com/api/storesearch/?term=${game_name}&l=english&cc=US`
            fetch(url)
                .then(r => r.text())
                .then(html => {
                    info=JSON.parse(html).items[0]
                    info_show(info)
                })
                .catch(error => {
                    console.log(error)
                });

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
<br><br>
<i>Steam ID: ${info.id}</i>
<a style='text-decoration: underline;'href="https://store.steampowered.com/app/${info.id}/" target="_blank">Steam Store Page</a>
<br>
    `
}