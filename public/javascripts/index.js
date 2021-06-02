

let addtocart=document.querySelectorAll('.butttoncart')
function updateCart(data){
  axios.post('/update-cart',data).then(res=>{
    console.log(res);
     cartCounter.innerText=res.data.totalQty
    Command: toastr["success"]("Item added to cart")
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "slideDown",
        "hideMethod": "slideUp"
      }
  }).catch(err=>{
    Command: toastr["error"]("Something went wrong")

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "slideDown",
        "hideMethod": "slideUp"
      }
  })
}

addtocart.forEach((btn)=>{
  btn.addEventListener('click',(e)=>{
    let data=JSON.parse(btn.dataset.books)
    console.log(data);
    updateCart(data)
  })
})






 function initAdmin() {
  const orderTableBody = document.querySelector('#orderTableBody')
  let orders = []
  let markup;

  axios.get('/admin/orders', {
    headers: {
        "X-Requested-With": "XMLHttpRequest"
    }
}).then(res => {
    orders = res.data
    markup = generateMarkup(orders)
    orderTableBody.innerHTML = markup
}).catch(err => {
    console.log(err)
})

  function renderItems(items) {
      let parsedItems = Object.values(items)
    
      return parsedItems.map((menuItem) => {
          return `
              <p> ${ menuItem.item.name } - ${ menuItem.qty } pcs </p>
          `
      }).join('')
    }

    function generateMarkup(orders) {
      return orders.map(order => {
          return `
              <tr>
              <td>
                  <p>${ order._id }</p>
                  <div>${ renderItems(order.items) } </div>
              </td>
              <td style="width: 120px; text-align: center;">${ order.customerid.name }</td>
              <td style="width: 220px; text-align: center;">${ order.address }</td>
              <td style="width: 220px; text-align: center;">
                  <div class="inline-block">
                      <form action="/admin/order/status" method="POST">
                          <input type="hidden" name="orderId" value="${ order._id }">
                          <select name="status" onchange="this.form.submit()" class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline ">
                              <option value="order_placed"
                                  ${ order.status === 'order_placed' ? 'selected' : '' }>
                                  Placed</option>
                              <option value="confirmed" ${ order.status === 'confirmed' ? 'selected' : '' }>
                                  Confirmed</option>
                              <option value="prepared" ${ order.status === 'prepared' ? 'selected' : '' }>
                                  Prepared</option>
                              <option value="delivered" ${ order.status === 'delivered' ? 'selected' : '' }>
                                  Delivered
                              </option>
                              <option value="completed" ${ order.status === 'completed' ? 'selected' : '' }>
                                  Completed
                              </option>
                          </select>
                      </form>
                  </div>
              </td>
              <td>
                  ${ moment(order.createdAt).format('MMMM Do YYYY, h:mm:ss a') }
              </td>
              <td>
              ${ order.paymentStatus ? 'Paid' : 'Not Paid' }
          </td>
          </tr>
      `
      }).join('')
  }

}
initAdmin();

// Change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    })

}

updateStatus(order);