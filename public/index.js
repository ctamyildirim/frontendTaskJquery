$(document).ready(function(){

  // İlk yükleme sırasında lokasyon verisini alıp fonksiyonu çağırıyoruz. Aldığımız lokasyon verisine göre işlemlere devam edeceğiz.
  findLocation();

  // Lazyload için scroll durumunnun kontrolü
  $(window).scroll(()=>{
    let screen_height = $(window).height();
    let scrollTop = $(window).scrollTop();
    let body_heigth = $('body').height();

    // Yeterince scroll edildiğinde API Request yapılması
    if(scrollTop + 400 > body_heigth - screen_height && is_loading == false){ 
      is_loading= true;
      postData(searchInputValue)
    }
  })
  let timeout ;
  var reset = true;
  $(document).on('keyup', searchInput , ()=>{
    
    clearTimeout(timeout);
    searchInputValue = searchInput.val();
    // Her tuşa basmada sorgu yapmak yerine performans açısından kullanıcı 1sn Boyunca Yazmayı Bırakırsa API sorgusu yapıyoruz.
    timeout = setTimeout(function () {
        counter = 0;
        reset == true ? $('.contents').children().remove() : null ;
        postData(searchInputValue)
    }, 1000);
  })
  
})

//Restoran Kartlarımızın İşlemleri
const cardHandling = (item , idx) =>{
  // Kullanacağımız değişkenleri tanımlıyor ve bilgi eksikliğine veya çift taraflı bilgiye karşılık if-else kontrollerimizi yapıyoruz
  let img_path ;  item.images.length > 0 ? img_path = item.images[0].base64 : img_path= '';  
  let min_order_price = item.storeInfo.minOrderPrice;                                         
  let status ;  item.storeInfo.status == 'open' ? status = 'Açık' : status = 'Kapalı';      
  let working_hours ;
  let rate = Math.floor(item.storeInfo.rate * 10) / 10  //Virgülden sonra tek haneli doğru rakamı almak için
    item.storeInfo.workingHours.length > 0 ? working_hours = item.storeInfo.workingHours[0] : working_hours = {open:'Bilinmiyor',close:''}
  let coordinates = item.location.coordinates;

  let distance = getDistance(latitude, longitude , coordinates[1] , coordinates[0])  //Restoranın konuma olan mesafesini hesaplayan fonksiyonumuz.

  // Her bir restoran kartımızın içine dinamik verilerin yerleştirilmiş şablonu
  var card_style = `
                      <div class="div col-12 p-0" id=${idx}>
                        <div class="content_card row p-0">
                            <div class="image_inclusive col-12 p-0">
                                <img class='content_car_header_img' src="${img_path}" alt="Resim Dosyası Bulunamamıştır">
                                <div class="rate_zone font-12">
                                    <div>
                                        <span class="star_wrapper"><img src="./Images/Main/content/Group 1219@3x.png" alt=""></span>
                                        <span class="rate_wrapper">${rate.toFixed(1)}</span>
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
  //Kartımızı ilgili alana ekliyoruz.
  $('.contents').append(card_style);
}
//Search Input Verilerimiz.
let searchInput = $(".search_input")
let searchInputValue = searchInput.val();

//API Request
const postData = async (searchInputValue) => {
  //1- API isteği arama alanından mı yapıldı yoksa diğer yollardan mı kontrol ediyoruz.
  //2- Search Inputtan yapıldıysa tek seferde istek attığımız data sayısını arttırıyoruz ki filtreleme sonrası
  // sayfanın scroll olabilecek kadar dolması garantilensin
  let is_search = true;   
  payload = {
    "skip": counter * 20,
    "limit": 20,
    "latitude": latitude,
    "longitude": longitude
  }

  if (searchInputValue == undefined || searchInputValue == ''){   
    payload = {
      "skip": counter * 5,
      "limit": 5,
      "latitude": latitude,
      "longitude": longitude
    }
    is_search = false;
  }
  //3- API Fetch işlemimizi yapıyoruz.
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
    //-4 Edindiğimiz datayı map ile dönüyoruz.
    data.response.map((item , idx) => {
      //5- API sorgusunun Search Inputtan gelip gelmemesine bağlı olarak kart alanımızı önce temizleyerek daha sonra yeni datalarımızın card handling 
      //işlemini yapıyoruz.

      if(is_search == true){

        if(item.title.toLowerCase().includes(searchInputValue.toLowerCase()) == true){ // Search Inputtan gelen veriye göre itemleri filtreleme.
          cardHandling(item, idx);
          reset = false;
        }
      }
      else{
        cardHandling(item, idx);
        reset = true;
      }
    })
    counter ++;
    is_loading = false;
}
//Lokasyon Bilgisi Alma 
function findLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationApproved, locationDeclined);

    } else {
      alert("Tarayıcınız Geolocation API desteklemiyor.");
    }
}

var latitude;
var longitude;
var is_loading = false;   // API bağlantısı tamamlanma durumu kontrol değişkeni : 
var counter = 0;          //  Lazyload sırasında yaptığımız işlem sayısı sayıcısı

//Kullanıcı Lokasyon Bilgisine İzin Verirse
async function locationApproved(pos) {
  latitude = await pos.coords.latitude
  longitude = await pos.coords.longitude
  postData(searchInputValue)
}
//Kullanıcı Lokasyon Bilgisine İzin Vermezse
async function locationDeclined(){
  latitude = 0;
  longitude = 0;
  postData(searchInputValue)

}

// Kullanıcının paylaştığı enlem ve boylama göre restoranın uzaklık hesabını yapıyoruz.
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
// Degree to Radian & Radian to Degree Functions
function deg2rad(deg){
  return deg* Math.PI /180;
}
function rad2deg(rad){
  return rad* 180 / Math.PI;
}





  
