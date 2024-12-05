console.log("connected")
// Number of copies increment and decrement
const shopownerid = '1234';
const shopId = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1]
console.log("ShopID:", shopId)

let cId;

let isLoggedIn = false
if (sessionStorage.getItem('isLoggedIn') === 'true') {
  isLoggedIn = true;
  cId = sessionStorage.getItem('cId')
}
console.log("LogIn:", isLoggedIn)
console.log("CID console:", cId)
let shopName = "";
let shopAddress = "";

fetch(`/findShopDetails/${shopId}`)
  .then(res => { return res.json() })
  .then(data => {
    console.log(data.body[0].name)
    shopName = data.body[0].name;
    shopAddress = data.body[0].address;
    const outlet_details = document.querySelectorAll(".outlet_details")
    if (shopName == "") {
      // outlet_details[0].innerHTML = `Select a PrintOutlet<span></span>`
    }
    outlet_details[0].innerHTML = `${shopName}<span>${shopAddress}</span>`

  })


let color_price = 10;
let bw_price = 2;

let totalPrice = 0;
let filesCount = 1;



function goBack() {
  history.back();
  console.log("hii")
}




let upload_extra_files = document.querySelectorAll(".upload_extra_files");
let price_summary_cont = document.querySelectorAll(".price_summary_cont")
let fileUpload = document.querySelectorAll('.fileUpload');
fileUpload[0].addEventListener('click', () => {
  if (!fileUpload[0].files[0]) {
    if (isLoggedIn === false) {
      alert('Please Log in before Checking Out')
      window.location.href = '/login'
    }
  }
})

let i = 0;

function addUploadEventListener(element) {
  element.addEventListener('click', () => {
    upload_extra_files[0].style.display = 'none';
    price_summary_cont[0].style.display = 'none';
    const upload_files_cont = document.createElement('div')
    upload_files_cont.className = "upload_files_cont"
    upload_files_cont.innerHTML = `<div class="upload_sub_text">Maximum file size: 50MB</div>
        <input type="file" id="fileInput" name="myFile" class="fileUpload">
        <div class="files_settings_cont">
            Print Settings
            <span>Same print settings apply to all documents</span>
            <div class="settings_sub_div">
            <div class="print_color_div">
                <img class="bnw" src="../imgs/palette-print-svgrepo-com.svg" alt="" srcset=""><span class="settings_caption">Monochrome</span>
                <img class="color" src="../imgs/palette-print-svgrepo-com (1).svg" alt="" srcset=""><span class="settings_caption">Color</span>
            </div>
            <div class="print_orientation_div">
                <img class="potrait" src="../imgs/document-svgrepo-com.svg" alt="" srcset=""><span class="settings_caption">Potrait</span>
                <img class="landscape" src="../imgs/document-landscape-svgrepo-com.svg" alt="" srcset=""><span class="settings_caption">Landscape</span>
            </div>
        </div>
       
            <div class="print_copies_div">
                <span>Choose number of copies</span>
                <div class="input-group">
                    <button id="decrement">-</button>
                    <input type="number" id="input" value="1" readonly>
                    <button id="increment">+</button>
                  </div>
            </div>
            <div class="print_both_sides">
                <span>Print on Both Sides</span>
                <input type="checkbox" id="myCheckbox" name="myCheckbox" value="checked" class="printBothSides_ip">
            </div>
        </div>     
        </div>`
    const body = document.querySelectorAll('body')
    body[0].appendChild(upload_files_cont)
    body[0].appendChild(upload_extra_files[0]);
    body[0].appendChild(price_summary_cont[0])

    upload_extra_files[0].style.display = 'block';
    price_summary_cont[0].style.display = 'flex';
    price_summary_cont[0].style.position = 'sticky';
    fileUpload = document.querySelectorAll('.fileUpload');
    filesCount += 1;
  });
}

// Attach event listener to the initial element
addUploadEventListener(upload_extra_files[0]);




let bnw = document.querySelectorAll(".bnw");
let color = document.querySelectorAll(".color");
let potrait = document.querySelectorAll(".potrait");
let landscape = document.querySelectorAll(".landscape");
let bothSides_ip = document.querySelectorAll(".printBothSides_ip")

let print_color_settings = 'Black n White';
let print_orientation_settings = 'Potrait';
let print_bothSides = false

bnw[0].style.background = "#2b425765";
potrait[0].style.background = "#2b425765";

color[0].addEventListener('click', () => {
  color[0].style.background = "#2b425765";
  bnw[0].style.background = "";
  print_color_settings = "color";
  console.log(print_color_settings)
  totalPriceCalc(print_color_settings)
})
bnw[0].addEventListener('click', () => {
  bnw[0].style.background = "#2b425765";
  color[0].style.background = "";
  print_color_settings = "Black n White";
  console.log(print_color_settings)
  totalPriceCalc(print_color_settings)
})

landscape[0].addEventListener('click', () => {
  landscape[0].style.background = "#2b425765";
  potrait[0].style.background = "";
  print_orientation_settings = "landscape";
  console.log(print_orientation_settings)
  totalPriceCalc(print_color_settings)
})
potrait[0].addEventListener('click', () => {
  potrait[0].style.background = "#2b425765";
  landscape[0].style.background = "";
  print_orientation_settings = "potrait";
  console.log(print_orientation_settings)
  totalPriceCalc(print_color_settings)
})


let counter = 1;
function increment() {
  counter++;
}
function decrement() {
  counter--;
}
function get() {
  return counter;
}
const inc = document.getElementById("increment");
const input = document.getElementById("input");
const dec = document.getElementById("decrement");

inc.addEventListener("click", () => {
  increment();
  input.value = get();
  totalPriceCalc(print_color_settings)
});
dec.addEventListener("click", () => {
  if (input.value > 0) {
    decrement();
  }
  input.value = get();
  totalPriceCalc(print_color_settings)
});




const checkout_btn = document.getElementsByClassName('checkout_btn');








let numPages;

//price calculation
async function pricePerFile(file, color) {


  if (!file) {
    alert('Please upload a file.');
    return;
  }

  if (file.type === 'application/pdf') {
    // For PDF files
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    numPages = pdfDoc.getPageCount();

  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // For DOCX files
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    numPages = (result.value.match(/\f/g) || []).length + 1;

  } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    // For PPTX files
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const slideFiles = Object.keys(zip.files).filter(filename =>
      filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')
    );

    numPages = slideFiles.length;
    console.log('Number of slides:', numPages);
    return numPages;
  } else if (file.type.startsWith('image/')) {
    // For image files (JPG, PNG, etc.)
    numPages = 1;

  } else {
    alert("UNSUPPORTED FILE FORMAT!!")
  }

  if (color === "Black n White") {
    return counter * (numPages * bw_price);
  }
  else {
    return counter * (numPages * color_price)
  }

}
let total_price = document.querySelectorAll(".total_price")
let no_of_pages = document.querySelectorAll(".no_of_pages")

async function totalPriceCalc(color) {

  for (let i = 0; i < filesCount; i++) {
    pricePerFile(fileUpload[i].files[0], color).then(price => {
      console.log("Price:", price)
      no_of_pages[0].innerHTML = `Total ${numPages} pages`
      total_price[0].innerHTML = `<b>${price}/-</b>`
      totalPrice = price
    })
  }
}



document.body.addEventListener('change', function (event) {
  if (event.target && event.target.classList.contains('fileUpload')) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/svg+xml'];
      if (allowedTypes.includes(file.type)) {
        console.log('File type is valid:', file.type);
        totalPriceCalc(print_color_settings);
      } else {
        alert('Invalid file type. Please upload a PDF, JPG, PNG, or SVG file.');
        event.target.value = '';
      }
    }
  }
});




const loadingDiv = document.getElementById('loading');
checkout_btn[0].addEventListener('click', () => {
  loadingDiv.style.display = 'block';
  const file = fileInput.files;
  if (isLoggedIn === false) {
    alert('Please Log in before Checking Out')
    window.location.href = '/login'
  }
  const formData = new FormData();
  for (let i = 0; i < file.length; i++) {
    formData.append('file', file[i]); // The name 'files' should match the multer configuration
  }
  console.log("Inside checlout:", cId)
  formData.append('cId', cId)
  formData.append('file', file);
  formData.append('shopownerid', shopownerid);
  formData.append('color_settings', print_color_settings);
  formData.append('orientation_settings', print_orientation_settings);
  formData.append('print_copies', counter);
  formData.append('amt', totalPrice)
  // Send the file to the server using fetch
  fetch('/checkout', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data); 
      loadingDiv.style.display = 'none'; // Hide the loading message 
      let url = data.url; 
      console.log(url); 
      window.location.href = url;
    })
    .catch((error) => {
      console.error('Error:', error);
      loadingDiv.style.display = 'none';
      alert('File upload failed');
    });
});


