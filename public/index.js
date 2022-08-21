$(document).ready(function(){

  // Getting location and loading first items
  findLocation();

  // Checking scroll for lazyload paging
  $(window).scroll(()=>{
    let screen_height = $(window).height();
    let scrollTop = $(window).scrollTop();
    let body_heigth = $('body').height();

    if(scrollTop > body_heigth - screen_height && is_loading == false){
      is_loading= true;
      postData()
    }
  })
  
})

//API Request
const postData = async () => {
    payload = {
      "skip": counter * 3,
      "limit": 3,
      "latitude": latitude,
      "longitude": longitude
    }
    const response =  await fetch("https://smarty.kerzz.com:4004/api/mock/getFeed", {
        body: JSON.stringify(payload),
        headers: {
            Accept: "application/json",
            Apikey: "bW9jay04ODc3NTU2NjExMjEyNGZmZmZmZmJ2",
            "Content-Type": "application/json"
        },
        method: "POST"
        })

    const data = await response.json()
    
    data.response.map((item , idx) => {
      //Getting data to use on card and checking them according to situations
      let img_path ;  item.images.length > 0 ? img_path = item.images[0].base64 : img_path= '';  
      let min_order_price = item.storeInfo.minOrderPrice;                                         
      let status ;  item.storeInfo.status == 'open' ? status = 'Açık' : status = 'Kapalı';      
      let working_hours ;
        item.storeInfo.workingHours.length > 0 ? working_hours = item.storeInfo.workingHours[0] : working_hours = {open:'Bilinmiyor',close:''}
      let coordinates = item.location.coordinates;

      let distance = getDistance(latitude, longitude , coordinates[1] , coordinates[0])  

      // Each Restaurant Card Item
      var card_style = `
                          <div class="div col-12 p-0" id=${idx}>
                            <div class="content_card row p-0">
                                <div class="image_inclusive col-12 p-0">
                                    <img class='content_car_header_img' src="${img_path}" alt="Resim Dosyası Bulunamamıştır">
                                    <div class="rate_zone font-12">
                                        <div>
                                            <span class="star_wrapper"><img src="./Images/Main/content/Group 1219@3x.png" alt=""></span>
                                            <span class="rate_wrapper">4.9</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="content_details col-12 d-flex flex-column justify-content-between">
                                    <div class="content_head row m-0">
                                        <div class="col-9 p-0 content_title">${item.title}</div>
                                        <div class="col-6 p-0 font-12 opacity-50 content_type">Coffee, Tatlı</div>
                                    </div>
                                    <div class="content_body col-12 p-0">
                                        <div class="row m-0">
                                            <div class="col-6 p-0 offset-6 font-12 content_min_cost d-flex justify-content-end">
                                                <span class="img_wrapper mr-1"><img src="./Images/Main/content/shopping_basket-24px.png" alt=""></span>
                                                <span class="text_wrapper opacity-50">Min. Sipariş Tutarı : ${min_order_price}</span>
                                            </div>
                                            <div class="col-5 p-0 font-12 ">${distance} yakınında</div>
                                            <div class="col-7 p-0 font-12 d-flex justify-content-end">
                                              <span class="status_${item.storeInfo.status} mr-1">İşletme ${status}</span>
                                              <span class='workingHours'>${working_hours.open} / ${working_hours.close} </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                          </div>
                        `;

      
      $('.contents').append(card_style);
    })
    counter ++;
    is_loading = false;
}

//Getting Location Data 
function findLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationApproved, locationDeclined);

    } else {
      alert("Tarayıcınız Geolocation API desteklemiyor.");
    }
}

var latitude;
var longitude;
var is_loading = false;   // API fetching completion status control variable : 
var counter = 0;          // For Lazyload

//If User approve location permission
async function locationApproved(pos) {
  latitude = await pos.coords.latitude
  longitude = await pos.coords.longitude
  postData()
}
//If User doesn't approve location permission
async function locationDeclined(){
  latitude = 0;
  longitude = 0;
  postData()

}

// Calculating Distance By Using Latitude and Longitude Data
function getDistance(latitude1, longitude1, latitude2, longitude2) {
  let theta = longitude1 - longitude2; 
  let distance = (Math.sin(deg2rad(latitude1)) * Math.sin(deg2rad(latitude2))) + (Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) * Math.cos(deg2rad(theta))); 
  distance = Math.acos(distance); 
  distance = rad2deg(distance); 
  distance = distance * 60 * 1.1515; 
  distance = distance * 1.609344; 
  distance < 1 ? distance = Math.round(distance * 1000) + ' m' : distance = (distance).toFixed(1) + ' km'
  return distance; 

}
// Degree to Radian and Radian to Degree Functions
function deg2rad(deg){
  return deg* Math.PI /180;
}
function rad2deg(rad){
  return rad* 180 / Math.PI;
}





  
