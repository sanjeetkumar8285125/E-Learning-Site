
function updateddata(data){
axios.post('/paynow',data).then(res=>{
console.log(res)
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

const butttoncart= document.querySelector('.butttoncart')
butttoncart.addEventListener('click',(e)=>{
    let data=JSON.parse(butttoncart.dataset.courses)

    updateddata(data)
})

//this is for accordion courses
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}