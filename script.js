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

const date = new Date();
const id = date.now;
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  click = 0;
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.input[0].toUpperCase()}${this.input.slice(
      1
    )} on ${months[this.date.getMonth()]} ${this.date.getDate()}.`;
  }

  _click() {
    this.click++;
  }
}

class Running extends Workout {
  input = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  input = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.pace;
  }
}

const cycling = new Cycling([120, -457], 50, 45, 150);

////////////////////////////////////////////// App Class/////////////////////////////
class App {
  #map;
  #mapEvent;
  #workoutList = [];
  constructor() {
    this._getLocalStorage();

    this._getPosition();
    // this.#map.on('click', this._showForm.bind(this));
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('Failed to get current location');
      }
    );
  }

  _loadMap(position) {
    console.log('Got your position');
    const { latitude, longitude } = position.coords;
    const cords = [latitude, longitude];
    this.#map = L.map('map').setView(cords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(cords)
      .addTo(this.#map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();

    this.#map.on('click', this._showForm.bind(this));
    this.#workoutList.forEach(work => this._renderMarker(work));
  }

  _showForm(event) {
    this.#mapEvent = event;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  allPositive(...numbers) {
    return numbers.every(num => Number(num) > 0);
  }

  ifFinite(...numbers) {
    numbers.every(num => Number.isFinite(num));
  }

  // Method for generating marker on Map
  _renderMarker(workout) {
    console.log(workout.input);
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          autoClose: false,
          className: `${workout.input}-popup`,
        })
      )
      .setPopupContent(
        `${workout.input == 'cycling' ? '🚴‍♀️' : '🏃‍♂️'}  ${workout.description}`
      )
      .openPopup();
  }

  // Creating New Workout
  _newWorkout(e) {
    e.preventDefault();
    let workout;

    // Storing data recieved from Form into variables
    const input = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // Creating marker for cycling
    if (input == 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !this.allPositive(distance, duration) &&
        !this.ifFinite(distance, duration, elevation)
      ) {
        return alert('Number is not valid');
      } else {
        workout = new Cycling([lat, lng], distance, duration, elevation);
        this._renderMarker(workout);
      }
    }

    // Showing Marker if Workout type is running
    if (input === 'running') {
      const cadence = +inputCadence.value;
      if (
        !this.allPositive(distance, duration) &&
        !this.ifFinite(distance, duration, cadence)
      ) {
        return alert('Number is not valid');
      } else {
        workout = new Running([lat, lng], distance, duration, cadence);
        this._renderMarker(workout);
      }
    }

    // Pushing the newly created workout object into Array to further render it as list
    this.#workoutList.push(workout);
    this._renderWorkout(workout);
    this._setLocalStorage();
    this._hideForm();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.input}" data-id=${workout.id}>
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.input == 'cycling' ? '🚴‍♀️' : '🏃‍♂️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (workout.input == 'running') {
      html += `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace}.</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
    `;
    } else {
      html += `
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToMarker(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workoutList.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    workout._click();
  }
  _setLocalStorage() {
    localStorage.setItem('workout', JSON.stringify(this.#workoutList));
  }
  _getLocalStorage() {
    const obj = JSON.parse(localStorage.getItem('workout'));
    if (!obj) return;
    this.#workoutList = obj;
    obj.forEach(work => this._renderWorkout(work));
  }

  resetLocalStorage() {
    localStorage.removeItem('workout');
    location.reload();
  }
}

const app = new App();
