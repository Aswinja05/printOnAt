
console.log("hi")


const shopownerid = '1234';
const activeOrdersDiv = document.querySelector('.active_orders_div');

let deliverFormIp = document.querySelectorAll('.deliverFormIp')
let deliverFormBtn=document.querySelectorAll('.deliverFormBtn')
deliverFormBtn[0].addEventListener('click',async ()=>{
  let Dcode=deliverFormIp[0].value;
  console.log('clicked',Dcode)

  await fetch('/orderDelivery',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ Dcode })

  })
})

function openDashboard(){
  console.log("hlo");
  let dashboard = document.querySelectorAll('.dashboard')
  if (dashboard[0].classList.contains('show')) {
    dashboard[0].classList.remove('show');
    activeOrdersDiv.style.display='flex';
  }
  else {
    dashboard[0].classList.add('show');
    activeOrdersDiv.style.display='none';
  }
}


//Prices And Availability

let color=10;
let bnw=5;
let colorAvailable=1;
let bnwAvailable=1;

let dashboardBtn = document.querySelectorAll('.dashboardBtn');
let priceInput = document.querySelectorAll('.priceInput')
let availablityImgs =document.querySelectorAll('.availablityImgs')
dashboardBtn[0].addEventListener('click',async ()=>{
  console.log("clicked")
  color=priceInput[0].value
  bnw=priceInput[1].value
  if(availablityImgs[0].style.background=='none'){
    bnwAvailable=0
  }
  else{
    bnwAvailable=1;
  }
  if(availablityImgs[1].style.background=='none'){
    colorAvailable=0
  }
  else{
    colorAvailable=1;
  }
  const data = await fetch(`/UpdatePrintSettings/${shopownerid}`,{
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body:JSON.stringify({ color,bnw,bnwAvailable,colorAvailable })
  })
  openDashboard();
})


availablityImgs[0].addEventListener('click',()=>{
  if(availablityImgs[0].style.background=='none'){
    availablityImgs[0].style.background='rgb(193 231 160)'
  }
  else{
    availablityImgs[0].style.background='none'
  }
})
availablityImgs[1].addEventListener('click',()=>{
  if(availablityImgs[1].style.background=='none'){
    availablityImgs[1].style.background='rgb(193 231 160)'
  }
  else{
    availablityImgs[1].style.background='none'
  }
})

fetch(`/shopowner/${shopownerid}`)
  .then(response => response.json())
  .then(data => {
    if (data.files && data.files.length > 0) {
      console.log(data.files)

      data.files.forEach(file => {
        const filenameElement = document.createElement('p');
        filenameElement.textContent = `Filename:`;
        const filenameElement_cont = document.createElement('span');
        filenameElement_cont.textContent = ` ${file.originalname}`;
        filenameElement.appendChild(filenameElement_cont)

        console.log("IS ORDER READY: ", file.orderReady)

        const sizeElement = document.createElement('p');
        sizeElement.textContent = `Size:`;
        const sizeElement_cont = document.createElement('span');
        sizeElement_cont.textContent = ` ${file.size} bytes`;
        sizeElement.appendChild(sizeElement_cont)

        const mimeTypeElement = document.createElement('p');
        mimeTypeElement.textContent = `MIME Type:`;
        const mimeTypeElement_cont = document.createElement('span');
        mimeTypeElement_cont.textContent = ` ${file.mimetype}`;
        mimeTypeElement.appendChild(mimeTypeElement_cont)

        const markbtn = document.createElement('div');
        markbtn.textContent = `Mark as Done`;
        markbtn.className = 'active_orders_btn';

        // Append elements to the active orders div
        const fileContainer = document.createElement('div');
        fileContainer.className = 'active_orders';
        if(file.delivered){
          fileContainer.style.background="rgb(92 191 5 / 38%)"
        }
        else if(file.orderReady){
          fileContainer.style.background="rgb(161 151 10 / 19%)"
        }
        else{
          fileContainer.style.background="rgb(0 0 0 / 3%)"
        }


        let custName;
        fetch(`/findCustomer/${file.cId}`)
          .then(response => response.json())
          .then(d => {
            console.log(d.body.name)
            custName = document.createElement('p');
            custName.textContent = `Customer:`;
            const custName_cont = document.createElement('span');
            custName_cont.textContent = ` ${d.body.name}`;
            custName.appendChild(custName_cont)
            fileContainer.appendChild(custName);
            fileContainer.appendChild(filenameElement);
            fileContainer.appendChild(sizeElement);
            fileContainer.appendChild(mimeTypeElement);
            const settings = document.createElement('div');
            settings.className = 'active_orders_settings';

            const bnw_img = document.createElement('img');
            bnw_img.setAttribute("src", "../imgs/palette-print-svgrepo-com.svg")
            settings.appendChild(bnw_img)

            const color_img = document.createElement('img');
            color_img.setAttribute("src", "../imgs/palette-print-svgrepo-com (1).svg")
            settings.appendChild(color_img)

            const potrait_img = document.createElement('img');
            potrait_img.setAttribute("src", "../imgs/document-svgrepo-com.svg")
            settings.appendChild(potrait_img)

            const landscape_img = document.createElement('img');
            landscape_img.setAttribute("src", "../imgs/document-landscape-svgrepo-com.svg")
            settings.appendChild(landscape_img)

            if (file.color == "Black n White") {
              bnw_img.style.display = "block"
            }
            else {
              color_img.style.display = "block"
            }

            if (file.orien == "potrait") {
              potrait_img.style.display = "block"
            }
            else {
              landscape_img.style.display = "block"
            }

            const copies = document.createElement('div')
            copies.textContent = `${file.copies}`
            copies.className = "copies"
            settings.appendChild(copies)

            fileContainer.appendChild(settings)



            const downloadLink = document.createElement('a');
            fetch(`/files/${shopownerid}`)
              .then(response => response.json())
              .then(data => {
                console.log('Files received:', data.files);

                data.files.forEach(file => {
                  // Create download link
                  downloadLink.href = file.downloadLink;
                  downloadLink.textContent = `Download File`;
                  downloadLink.target = '_blank';
                  
                });
              })
              .catch(error => {
                console.error('Error fetching files:', error);
              });

            fileContainer.appendChild(downloadLink);
            if (!file.orderReady) {
              fileContainer.appendChild(markbtn);
            }

            markbtn.addEventListener('click', async () => {
              let UID = file.UID;
              

              console.log("DCODE:",UID)
              
              
              
              const response = await fetch('/orderReady', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ UID })
              })
              console.log(response)
              if (response.ok) {
                markbtn.style.display = "none"

              }

            });

            activeOrdersDiv.appendChild(fileContainer);
          });
      })






    } else {
      console.log('No files found for this shopowner.');
    }
  })
  .catch(error => {
    console.error('Error fetching files:', error);
  });


