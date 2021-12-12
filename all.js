const api_path = 'skps0102';
const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`;
let folder = {
    products: 'products',
    carts: 'carts',
    orders: 'orders'
};
//取得API回傳產品資料
let productData = [];
//產品列表下拉選單
const productSelect = document.querySelector('.productSelect');
//產品列表ul
const productWrap = document.querySelector('.productWrap');
//購物車列表
const shoppingCartTable = document.querySelector('.shoppingCart-table');
//訂單資料表單
const orderInfoForm = document.querySelector('.orderInfo-form');

init();

function init(){
    getProductData();
    getShoppingCartData();
}

function getProductData(){
    axios.get(`${url}/${folder.products}`)
    .then(function (response) {
        //console.log(response.data.products);
        productData = response.data.products;
        //下拉選單render
        renderSelect(productData);
        //產品列表render
        renderProductList(productData);
        //渲染監聽
        addEventHandle();
    })
    .catch(function (error) {
        //console.log(error);
    })
}

function renderSelect(productData){
    const unSort = productData.map(item => item.category);
    //console.log('unSort productData',unSort);
    //indexOf回傳陣列中第一個被找到的索引
    const sorted = unSort.filter((item,index) => unSort.indexOf(item) === index);
    //console.log('sorted productData',sorted);
    let selectStr = '<option value="全部" selected>全部</option>';
    sorted.forEach(item => {
        selectStr += `<option value="${item}">${item}</option>`;
    })
    productSelect.innerHTML = selectStr;
}

function renderProductList(productData){
    //console.log(productSelect.value);
    const productSelectValue = productSelect.value === '全部'
    let newArry;
    if(productSelectValue){
        newArry = productData.filter(item => item.category !== productSelect.value);
    }else{
        newArry = productData.filter(item => item.category === productSelect.value);
    }
    //console.log(newArry); // expected output: Array ["exuberant", "destruction", "present"]
    let str = '';
    newArry.forEach(item => {
        str += `<li class="productCard">
                    <h4 class="productType">新品</h4>
                    <img src="${item.images}" alt="">
                    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                    <h3>${item.title}</h3>
                    <del class="originPrice">NT$${toCurrency(item.origin_price)}</del>
                    <p class="nowPrice">NT$${toCurrency(item.price)}</p>
                </li>`
    })
    productWrap.innerHTML = str;
}

function toCurrency(num){
    var parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function getShoppingCartData(){
    axios.get(`${url}/${folder.carts}`)
    .then(function (response) {
        //console.log(response);
        const shoppingData = response.data;
        renderShoppingCartList(shoppingData);
    })
    .catch(function (error) {
        //console.log(error);
    })
}

function addShoppingCart(id){
    const payloadData = {
        data: {
            productId: id,
            quantity: 1
        }
    };
    axios.post(`${url}/${folder.carts}`,payloadData)
    .then(function (response) {
        //console.log('加入購車成功',response);
        swal("完成", "已將商品加入購物車!", "success");
        const shoppingData = response.data;
        //render購物車列表
        renderShoppingCartList(shoppingData);
    })
    .catch(function (error) {
        //console.log(error);
    })
}

function updateCartQuantity(id,num){
    if(num < 1) return;
    const payloadData = {
        data: {
            id: id,
            quantity: num
        }
    };
    axios.patch(`${url}/${folder.carts}`,payloadData)
    .then(function (response) {
        //console.log('更新數量',response);
        const shoppingData = response.data;
        //render購物車列表
        renderShoppingCartList(shoppingData);
    })
    .catch(function (error) {
        const errorResp = error.response;
        if(errorResp.status === 400){
            //console.log(errorResp.data.message);
        }
    })
}

function renderShoppingCartList(shoppingData){
    const shoppingArryData = shoppingData.carts;
    let str = `<tr>
                    <th width="40%">品項</th>
                    <th width="15%">單價</th>
                    <th width="15%">數量</th>
                    <th width="15%">金額</th>
                    <th width="15%"></th>
                </tr>`;
    
    if(shoppingArryData.length === 0){
        str += `<tr>
                    <th width="50%">請選擇商品加入</th>
                </tr>`;
    }else{
        shoppingArryData.forEach(item => {
            str += `<tr>
                        <td>
                            <div class="cardItem-title">
                                <img src="${item.product.images}" alt="${item.product.category}">
                                <p>${item.product.title}</p>
                            </div>
                        </td>
                        <td>NT$${toCurrency(item.product.price)}</td>
                        <td class="quantity-count">
                            <a href="#" class="material-icons" data-event="removeQuantity" data-num="${item.quantity - 1}" data-id="${item.id}">remove</a>
                                ${item.quantity}
                            <a href="#" class="material-icons" data-event="addQuantity" data-num="${item.quantity + 1}" data-id="${item.id}">add</a>
                        </td>
                        <td>NT$${toCurrency(item.product.price * item.quantity)}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons" data-id="${item.id}" data-event="removeItem">
                                clear
                            </a>
                        </td>
                    </tr>`;
        })
        str += `<tr>
                    <td>
                        <a href="#" class="discardAllBtn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${toCurrency(shoppingData.finalTotal)}</td>
                </tr>`;
    }

    shoppingCartTable.innerHTML = str;
}

function deleteShoppingCartItem(id){
    axios.delete(`${url}/${folder.carts}/${id}`)
    .then(function (response) {
        //console.log('已刪除一項商品',response);
        swal("完成", "已刪除一項商品!", "success");
        const shoppingData = response.data;
        //render購物車列表
        renderShoppingCartList(shoppingData);
    })
    .catch(function (error) {
        //console.log(error);
    })
}

function deleteShoppingCartAll(){
    axios.delete(`${url}/${folder.carts}`)
    .then(function (response) {
        //console.log('已將商品全部刪除',response);
        swal("完成", "已將商品全部刪除!", "success");
        const shoppingData = response.data;
        //render購物車列表
        renderShoppingCartList(shoppingData);
    })
    .catch(function (error) {
        //console.log(error);
    })
}

function createOrder(inputField){
    const payloadData = {
        data: {
            user: {}
        }
    };
    inputField.forEach(item => { payloadData.data.user[item.dataset.key] = item.value.trim(); })
    //console.log(payloadData);
    axios.post(`${url}/${folder.orders}`,payloadData)
    .then(function (response) {
        //console.log('成功建立訂單',response);
        swal("完成", "已成功建立訂單!", "success");
        orderInfoForm.reset();
        //重新取得購物車列表並render
        getShoppingCartData();
    })
    .catch(function (error) {
        const errorResp = error.response;
        //console.log(errorResp);
        if(errorResp.status === 400){
            console.log(errorResp.data.message);
            swal("錯誤", "購物車沒有商品，請加入商品到購物車!", "error");
        }
    })
}

function addEventHandle(){
    productSelect,addEventListener('change',function(e){
        const selectValue = productSelect.value;
        let tmpData = [];

        if(selectValue === '全部'){
            tmpData = productData.filter(item => item.category !== selectValue);
        }else{
            tmpData = productData.filter(item => item.category === selectValue);
        }

        renderProductList(tmpData);
    })

    productWrap.addEventListener('click',function(e){
        if(e.target.nodeName !== 'A') return;
        e.preventDefault();
        //加入購物車
        addShoppingCart(e.target.dataset.id);
    })

    shoppingCartTable.addEventListener('click',function(e){
        if(e.target.nodeName !== 'A') return;
        e.preventDefault();
        if(e.target.className !== 'discardAllBtn'){
            const id = e.target.dataset.id;
            const num = parseInt(e.target.dataset.num);
            if(e.target.dataset.event === 'removeQuantity'){
                //console.log('減1');
                updateCartQuantity(id,num)
                return;
            }
            if(e.target.dataset.event === 'addQuantity'){
                //console.log('加1');
                updateCartQuantity(id,num)
                return;
            }
            if(e.target.dataset.event === 'removeItem'){
                //console.log('刪除單一個');
                deleteShoppingCartItem(e.target.dataset.id);
                return;
            }
        }else{
            //console.log('刪除全部');
            deleteShoppingCartAll();
        }
    })


    const constraints = {
        "姓名": {
            presence: {
                message: "是必填的欄位"
            }, // 必填使用者名稱
        },
        "電話": {
            presence:{
                message: "是必填的欄位"
            },
        },
        "Email": {  
            presence:  {
              message: "是必填的欄位"
            }, // Email 是必填欄位
            email: true // 需要符合 email 格式
        },
        "寄送地址": {
            presence:{
                message: "是必填的欄位"
            },
        },
        "交易方式": {
            presence:{
                message: "是必填的欄位"
            },
        },
    };
    orderInfoForm.addEventListener('submit',function(e){
        e.preventDefault();
        const errors = validate(orderInfoForm, constraints);
        //console.log(errors);
        const inputField = orderInfoForm.querySelectorAll("input[name], select[name]");
        const alertMsg = document.querySelectorAll('.orderInfo-message');
        
        if (!errors){
            //console.log('Success');
            alertMsg.forEach(item => {item.innerHTML = '';})
            //新增訂單
            createOrder(inputField);
        }else{
            //console.log('error');
            inputField.forEach((item,index) => {
            if(Object.keys(errors).includes(item.name)){
                alertMsg[index].innerHTML = constraints[item.name].presence.message;
            }else{
                alertMsg[index].innerHTML = '';
            }
          })
        }
    });
}
