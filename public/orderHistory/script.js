let cId;
function goBack() {
    history.back();
    console.log("hii")
}
let isLoggedIn = false
if (sessionStorage.getItem('isLoggedIn') === 'true') {
    isLoggedIn = true;
    cId = sessionStorage.getItem('cId')
}
else {
    window.Location.href = '/login'
}

let history_cont = document.querySelectorAll('.history_cont')

fetch(`/orderHistory/${cId}`)
    .then(response => response.json())
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            console.log(data[i])
            let delivered = ''
            let ready = ''
            let placed = ''
            if (data[i].delivered) {
                console.log('del')
                delivered = 'completed'
                ready = 'completed'
                placed = 'completed'
            }
            else if (data[i].orderReady) {
                console.log('ready')
                ready = 'completed'
                placed = 'completed'
            }
            else {
                console.log('placed')
                placed = 'completed'
            }
            let history = document.createElement('div');
            history.className = 'history';
            history.innerHTML = `<div class="nearby_name">
            CMRIT Stationary<pre>0.5m</pre>
            <span>Aecs layout,IT park road,Bangalore-37 </span>
        </div>
        <div class="progress-bar">
            <div class="step ${placed}"></div>
            <div class="step ${ready}"></div>
            <div class="step ${delivered}"></div>
        </div>
        <div class="progress-bar">
            <div class="stepName">Placed</div>
            <div class="stepName">Ready</div>
            <div class="stepName">Delivered</div>
        </div>`
        
            history_cont[0].appendChild(history);
            

        }
    })

// function updateOrderStatus(currentStatus) {
//     const steps = document.querySelectorAll('.step');
//     steps.forEach(step => {
//         step.classList.remove('completed', 'current');
//     });

//     if (currentStatus === 'placed') {
//         steps[0].classList.add('completed');
//     } else if (currentStatus === 'ready') {
//         steps[0].classList.add('completed');
//         steps[1].classList.add('completed');
//     } else if (currentStatus === 'delivered') {
//         steps[0].classList.add('completed');
//         steps[1].classList.add('completed');
//         steps[2].classList.add('current');
//     }
// }

// Example usage:
// updateOrderStatus('delivered'); // Update the status to "Order Delivered"

