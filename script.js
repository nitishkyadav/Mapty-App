'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log('Got your position');
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      const cords = [latitude, longitude];
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      map = L.map('map').setView(cords, 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(cords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
      console.log(latitude);
      console.log(longitude);
      console.log(position);

      console.log(map);

      map.on('click', function (event) {
        mapEvent = event;
        form.classList.remove('hidden');
        inputDistance.focus();
        // mapEvent = event;
        // const { lat, lng } = mapEvent.latlng;
        // L.marker([lat, lng])
        //   .addTo(map)
        //   .bindPopup(
        //     L.popup({
        //       maxWidth: 300,
        //       minWidth: 100,
        //       autoClose: false,
        //       closeOnClick: false,
        //       autoClose: false,
        //       className: 'running-popup',
        //     })
        //   )
        //   .setPopupContent('WorkOut')
        //   .openPopup();
      });
    },
    function () {
      alert('Failed to get current location');
    }
  );
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';
  // inputDistance.focus();
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 300,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        autoClose: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('WorkOut')
    .openPopup();
});
