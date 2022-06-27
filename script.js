const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "z49z0w72y6zq",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "q2rhAq2kLC3EyIi3QX5r1ZKE_2H-iA3adHbfcyKIA-Y"
});


const cartIcon = document.querySelector(".cart-icon")
const closeCartBtn = document.querySelector(".closebtn")
const menuBar = document.querySelector(".menu-bar")
const clearCartBtn = document.querySelector(".clearbtn")
const cartDOM = document.querySelector(".cart")
const cartOverlay = document.querySelector(".cart-overlay")
const cartNumber = document.querySelector(".cart-number")
const cartTotal = document.querySelector(".total")
const cartContent = document.querySelector(".cart-content")
const productsDOM = document.querySelector(".products-items")

// cart
let cart = []
// buttons
let buttonsDOM = []


// getting the products
class Products{
  async getProducts(){
    try {
      let contentful = await client.getEntries({
        content_type: "comfyHouseProduct"
      })
      // let result = await fetch("products.json")
      // let data = await result.json()
      let products = contentful.items
      products = products.map(item =>{
      const {title, price} = item.fields
      const {id} = item.sys
      const image = item.fields.image.fields.file.url
      return {title,price,id,image}
      })
      return products
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI{
  displayProducts(products){
    let result = ""
    products.forEach(product=>{
      result += `
      <div class="products-content">
        <div class="product-image">
          <img class="image" src=${product.image} alt="">
          <button class="cart-entry" data-id=${product.id}>
            <i class="fas fa-cart-plus">add to cart</i>
          </button>
        </div>
        <p class="title">${product.title}</p>
        <p class="price">$${product.price}</p>    
      </div>
      `
    })
    productsDOM.innerHTML = result
  }
  getAddToCart(){
    const buttons = [...document.querySelectorAll(".cart-entry")]
    buttonsDOM = buttons
    buttons.forEach(button=>{
      let id = button.dataset.id
      let inCart = cart.find(item=> item.id === id)
      if(inCart){
        button.innerText = "IN CART"
        button.disabled = true
      }else{
        button.addEventListener("click", (e)=>{
          e.target.innerText = "IN CART"
          e.target.disabled = true
          // get product from products
          let cartItem = {...Storage.getProduct(id),amount:1}
          // add product to the cart
          cart = [...cart, cartItem]
          // save cart in local storage
          Storage.saveCart(cart)
          // set cart value
          this.setCartValues(cart)
          // display cart item
          this.addCartItem(cartItem)
          // show the cart
          this.showCart()
        })
      }
    })
  }
  setCartValues(cart){
    let tempTotal = 0
    let itemsTotal = 0
    cart.map(item=>{
      tempTotal += item.price * item.amount
      itemsTotal += item.amount
    })
    cartTotal.innerText = `$ ${parseFloat(tempTotal.toFixed(2))}`
    cartNumber.innerText = itemsTotal
  }
  addCartItem(item){
    const div = document.createElement("div")
    div.classList.add("cart-item")
    div.innerHTML = `
          <div class="cart-product">
            <div class="img"><img src=${item.image} alt=""></div>
            <div class="cart-product-text">
              <p>${item.title}</p>
              <p>$${item.price}</p>
              <p class="remove" data-id=${item.id}>remove</p>
            </div>
          </div>

          <div class="icon">
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>`
          cartContent.appendChild(div)
  }
  showCart(){
    cartOverlay.classList.add("show-overlay")
  }
  setUpApp(){
    cart = Storage.getCart()
    this.setCartValues(cart)
    this.pupolateCart(cart)
    cartIcon.addEventListener("click", this.showCart)
    menuBar.addEventListener("click", this.showCart) // added by me
    closeCartBtn.addEventListener("click", this.hideCart)
  }
  pupolateCart(cart){
    cart.forEach(item=> this.addCartItem(item))
  }
  hideCart(){
    cartOverlay.classList.remove("show-overlay")
  }
  cartLogic(){
    // clear cart button
    clearCartBtn.addEventListener("click", ()=>{
      this.clearCart()
    })
    // clear functionality
    cartContent.addEventListener("click", (e)=>{
      if(e.target.classList.contains("remove")){
        let removeItem = e.target
        let id = removeItem.dataset.id
        cartContent.removeChild(removeItem.parentElement.parentElement.parentElement)
        this.removeItem(id)
      }else if(e.target.classList.contains("fa-chevron-up")){
        let addAmount = e.target
        let id = addAmount.dataset.id
        let tempItem = cart.find(item=>item.id ===id)
        tempItem.amount = tempItem.amount + 1
        Storage.saveCart(cart)
        this.setCartValues(cart)
        addAmount.nextElementSibling.innerText = tempItem.amount
      }else if(e.target.classList.contains("fa-chevron-down")){
        let lowerAmount = e.target
        let id = lowerAmount.dataset.id
        let tempItem = cart.find(item=>item.id ===id)
        tempItem.amount = tempItem.amount - 1
        if(tempItem.amount > 0){
          Storage.saveCart(cart)
          this.setCartValues(cart)
          lowerAmount.previousElementSibling.innerText = tempItem.amount
        }else{
          cartContent.removeChild(lowerAmount.parentElement.parentElement)
          this.removeItem(id)
        }
      }
    })
  }
  clearCart(){
    let cartItems = cart.map(item => item.id)
    cartItems.forEach(id => this.removeItem(id))
    while(cartContent.children.length > 0){
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart()
  }
  removeItem(id){
    cart = cart.filter(item => item.id !== id)
    this.setCartValues(cart)
    Storage.saveCart(cart)
    let button = this.getSingleButton(id)
    button.disabled = false
    button.innerHTML = `<i class="fas fa-shopping-cart">add to cart</i>`
  }
  getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id === id)
  }
}

// local Storage
class Storage{
  static saveProducts(products){
    localStorage.setItem("products", JSON.stringify(products))
  }
  static getProduct(id){
    let products = JSON.parse(localStorage.getItem("products"))
    return products.find(product=> product.id === id)
  }
  static saveCart(cart){
    localStorage.setItem("cart", JSON.stringify(cart))
  }
  static getCart(){
    return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[]
  }
}


//DOMContentLoaded
document.addEventListener("DOMContentLoaded", ()=>{
  let ui = new UI()
  let products = new Products()
  // setUp App
  ui.setUpApp()
  // getting all products
  products.getProducts().then(products=> {
    ui.displayProducts(products)
    Storage.saveProducts(products)
  }).then(()=>{
    ui.getAddToCart()
    ui.cartLogic()
  }) 
})
