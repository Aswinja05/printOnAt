console.log("Connected")
function showContacts() {
  console.log("hlo");let contactList = document.querySelectorAll('.contactList')
  if (contactList[0].classList.contains('show')) {
    contactList[0].classList.remove('show');

  }
  else {
    contactList[0].classList.add('show');
  }
}

function openSearchCont() {
  let cont = document.getElementsByClassName("search_cont")
  cont[0].style.display = "block";
}
let cId;
let logInBtn = document.querySelectorAll(".logInBtn")
let ham_logInBtn = document.querySelectorAll(".ham_logInBtn")
let isLoggedIn = false
if (sessionStorage.getItem('isLoggedIn') === 'true') {
  isLoggedIn = true;
  logInBtn[0].style.display = "none"
  ham_logInBtn[0].style.display = "none"
  cId = sessionStorage.getItem('cId')
}
console.log("LogIn:", isLoggedIn)
console.log("CID console:", cId)


logInBtn[0].addEventListener('click', () => {
  window.location.href = "/login"
})

ham_logInBtn[0].addEventListener('click', () => {
  window.location.href = "/login"
})


let ham = document.querySelectorAll('.ham')
let ham_cont = document.querySelectorAll('.ham_cont')
ham[0].addEventListener('click', () => {
  ham_cont[0].style.display = 'block'

})

let xmark = document.querySelectorAll('.xmark')
xmark[0].addEventListener('click', () => {
  ham_cont[0].style.display = 'none'

})

let ham_list = document.querySelectorAll('.ham_list')

ham_list[1].addEventListener('click', () => {
  ham_cont[0].style.display = 'none'
  openSearchCont();
})




function pullDown() {
  let cont = document.getElementsByClassName("search_cont")
  cont[0].style.display = "none";
}












document.getElementById('locationInput').addEventListener('input', async function () {
  const query = this.value;
  if (query.length < 3) {
    document.getElementById('suggestions').innerHTML = '';
    return;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Bangalore')}&format=json&addressdetails=1&limit=5`);
    const places = await response.json();


    showSuggestions(places);
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
  }

});
var loc = ""
function showSuggestions(places) {
  const suggestionsBox = document.getElementById('suggestions');
  suggestionsBox.innerHTML = ''; // Clear existing suggestions

  places.forEach(place => {
    const suggestionItem = document.createElement('div');
    suggestionItem.className = 'suggestion-item';
    suggestionItem.textContent = place.display_name;
    suggestionItem.addEventListener('click', () => {
      loc = place.display_name;
      document.getElementById('locationInput').value = place.display_name;
      suggestionsBox.innerHTML = '';
      console.log(loc);

      geocodeLocation(loc)
        .then(async coords => {
          console.log(coords);
          const { latitude, longitude } = coords; // Destructure coordinates

          const circle = L.circle([latitude, longitude], {
            radius: 500,
            color: 'grey',
            fillColor: '#0000ff',
            fillOpacity: 0.1,
            weight: 1,
            scaleToZoom: true
          }).addTo(mymap);

          mymap.setView([latitude, longitude], 16);



          fetch(`/searchNearby/${latitude}/${longitude}`)
            .then(response => response.json())
            .then(data => {
              if (data.body && data.body.length > 0) {
                console.log("Retrieved nearby outlets from db:", data.body)
                data.body.forEach(outlet => {
                  L.marker([outlet.latitude, outlet.longitude], { icon: myIcon }).addTo(mymap).bindPopup(`<b>${outlet.name}</b><br><small>Colour: 10/- , B/W: 2/-  </small>`).on('click', function (e) {
                    this.openPopup();
                    document.getElementsByClassName("leaflet-popup-content-wrapper")[0].addEventListener('click', function () {
                      window.location.href = `/upload/${outlet._id}`;
                    });
                  });
                })
              }
            })
            .catch(error => {
              console.error('Error fetching nearby outlets:', error);
            });




        })
        .catch(error => {
          console.error("Error geocoding location:", error);
        });
    });
    suggestionsBox.appendChild(suggestionItem);
  });
}


async function geocodeLocation(location) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`);
  const data = await response.json();
  if (data.length > 0) {
    const { lat, lon } = data[0];
    return { latitude: lat, longitude: lon };
  } else {
    throw new Error("Location not found");
  }
}













var mymap = L.map('mapid').setView([12.971599, 77.594566], 18);
var myIcon = L.icon({
  iconUrl: '../imgs/pin-map-pointer-svgrepo-com.svg',
  iconSize: [35, 41],
  iconAnchor: [22, 41],
  popupAnchor: [-2, -35]
});
var currentLocationMarkericon = L.icon({
  iconUrl: '../imgs/current-location-svgrepo-com.svg',
  iconSize: [20, 35],
  iconAnchor: [0, 0],
  scaleToZoom: true
  // popupAnchor: [-2, -35]
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);
var mymap;
navigator.geolocation.getCurrentPosition(function (position) {
  mymap.setView([position.coords.latitude, position.coords.longitude], 16);
});



// var marker1 = L.marker([13.010024141564388, 77.67938282791175], { icon: myIcon }).addTo(mymap);
// marker1.bindPopup("<b>Cmrit Stationary</b><br><small>Colour: 10/- , B/W: 2/-  </small>").on('click', function (e) {
//   this.openPopup();

//   document.getElementsByClassName("leaflet-popup-content-wrapper")[0].addEventListener('click', function () {
//     window.location.href = '/upload';
//   });

// });



navigator.geolocation.getCurrentPosition(function (position) {


  var circle = L.circle([position.coords.latitude, position.coords.longitude], {
    radius: 10,
    color: '#0077e6',
    // fillColor: '#cce6ff',
    fillOpacity: 1,
    weight: 0,
    scaleToZoom: true
  }).addTo(mymap);


  mymap.setView([position.coords.latitude, position.coords.longitude], 16);


  fetch(`/searchNearby/${position.coords.latitude}/${position.coords.longitude}`)
    .then(response => response.json())
    .then(data => {
      if (data.body && data.body.length > 0) {
        console.log("Retrieved nearby outlets from db:", data.body)

        //Displaying nearby outlets on map
        data.body.forEach(outlet => {
          console.log("outlet id:", outlet._id)
          L.marker([outlet.latitude, outlet.longitude], { icon: myIcon }).addTo(mymap).bindPopup(`<b>${outlet.name}</b><br><small>Colour: 10/- , B/W: 2/-  </small>`).on('click', function (e) {
            this.openPopup();
            document.getElementsByClassName("leaflet-popup-content-wrapper")[0].addEventListener('click', function () {

              window.location.href = `/upload/${outlet._id}`;
            });
          });
        })

        //Displaying nearby outlets on in nearby section
        for (let i = 0; i < data.body.length; i++) {
          let outletName = data.body[i].name;
          let outletAddress = data.body[i].address;
          const nearby = document.querySelectorAll(".nearby")
          const nearby_list = document.createElement('div')
          nearby_list.className = "nearby_list"

          nearby_list.innerHTML = `<img src="../imgs/fdroid-nearby-svgrepo-com.svg" width="5%" srcset="">
            <div class="nearby_name">${outletName}<pre>0.2m</pre>
                <span>${outletAddress}</span>
            </div>
            <img class="dir_img" src="../imgs/direction-gps-location-map-navigation-pin-svgrepo-com.svg" width="5%" srcset="">`

          nearby[0].appendChild(nearby_list)
          nearby_list.addEventListener('click', function () {
            window.location.href = `/upload/${data.body[i]._id}`;
          });
        }
      }
      else {
        const nearby = document.querySelectorAll(".nearby")
        const nearby_list = document.createElement('div')
        nearby_list.className = "nearby_list"

        nearby_list.innerHTML = `OOPS! Couldn't Find any nearby Outlets`

        nearby[0].appendChild(nearby_list)
      }

    })
    .catch(error => {
      console.error('Error fetching nearby outlets:', error);
    });


  var centerButton = L.control();

  centerButton.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'center-button');
    div.innerHTML = '<button><img src="../imgs/current-location-svgrepo-com (1).svg" background="transparent" alt="" srcset=""></button>';
    return div;
  };

  centerButton.addTo(mymap);
  document.querySelector('.center-button button').addEventListener('click', function () {
    mymap.fitBounds(circle.getBounds());
    mymap.setView([position.coords.latitude, position.coords.longitude], 16);
  });
});












//upload
document.getElementsByClassName("uploadButton")[0].addEventListener('click', function () {
  window.location.href = '/upload';
});


