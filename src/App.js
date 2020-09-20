import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import './App.css';
import king from './error.jpg'

const blanc = "BLANC"
const loading = "loading...";
const error = "Something went wrong :(";
const noCur = "NO_CURRENCY"
const result = "RESULT"

function createMapOptions() {
  return {
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      stage: blanc,
      value: 'Netherlands',
      map: { lat: 55, lng: 10 },
      country: null,
      amount: 0,
      rate: 0,
      conversion: 0,
    }
  }

  fetchCountry() {
    this.setState({ stage: loading })
    fetch(`https://restcountries.eu/rest/v2/name/${this.state.value}?fullText=true`)
      .then(res => res.json())
      .then(json => {

        //if json contains array, put data into state.
        if (Array.isArray(json)) {
          this.setState({
            stage: result,
            location: {
              lat: json[0].latlng[0],
              lng: json[0].latlng[1]
            },
            country: {
              name: json[0].name,
              native: json[0].nativeName,
              translations: json[0].translations,
              capital: json[0].capital,
              population: json[0].population,
              currencies: json[0].currencies,
            },
          })

          //fetch exchange rate
          this.fetchExchange(json[0].currencies[0].code);
        }

        // else display error
        else {
          this.setState({ stage: error, })
        }

      })


  }

  fetchExchange(cc) {
    fetch(`https://api.exchangeratesapi.io/latest?base=SEK`)
      .then(res => res.json())
      .then(json => {

        // if rate exists, put it in state
        if (json.rates[cc]) {
          const rate = json.rates[cc];

          this.setState((state) => ({
            rate: rate,
            conversion: state.amount * rate,
          }));
        }

        // else handle with error
        else {
          this.setState({
            stage: noCur
          })
        }
      })
  }

  render() {
    return (
      <>
        <form
          className="row"
          style={{ display: 'flex' }}
          onSubmit={e => {
            e.preventDefault();
            this.fetchCountry();
          }}
        >
          <input
            className="input_text effect_shadow"
            type="text"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <input
            className="input_button effect_shadow"
            type="submit"
            value="search"
          />
        </form>

        {this.state.stage === result || this.state.stage === noCur
          ? (
            <>
              <div className="row">
                <h1>{this.state.country.name} ({this.state.country.native})</h1>
                <p><i>{Object.values(this.state.country.translations).join(', ')}</i></p>
                <b>Capital: </b><span>{this.state.country.capital}</span><br />
                <b>Population: </b><span>~{Math.round(this.state.country.population / 1000000)} million</span><br />
                <b>Currency: </b><span>{this.state.country.currencies.map(obj => `${obj.name}, ${obj.symbol}`)}</span><br />
              </div>

              {this.state.stage !== noCur
                ? (
                  <form
                    className="row"
                    onSubmit={e => {
                      e.preventDefault();
                      this.setState((state) => ({
                        amount: Number(state.amount).toFixed(2),
                        conversion: state.rate * state.amount,
                      }))
                    }}
                  >
                    <h2>Conversion</h2>
                    <div className="col">
                      <label>Swedish Krona</label>
                      <input
                        className="input_text effect_shadow"
                        value={this.state.amount}
                        onChange={e => this.setState({ amount: e.target.value })}
                      />
                    </div>
                    <div className="col">
                      <label>{this.state.country.currencies[0].name}</label>
                      <div className="input_text effect_shadow">
                        {!isNaN(this.state.conversion)
                          ? Number(this.state.conversion).toFixed(2)
                          : 0.00}
                      </div>
                    </div>
                  </form>
                ) : null}

              <div style={{ width: '100vw', height: '50vh' }}>
                <div className="row"><h2>Location</h2></div>
                <GoogleMapReact
                  bootstrapURLKeys={{ key: process.env.REACT_APP_GMAPS }}
                  options={createMapOptions}
                  defaultZoom={5}
                  defaultCenter={this.state.location}
                  center={this.state.location}
                />
              </div>
            </>
          ) : (this.state.stage === 'BLANC' ? null : (
            <>
              <div className="row stage">
                <div>{this.state.stage}</div>
                {this.state.stage === error
                  ? (
                    <img alt="its a joke." className="effect_shadow" src={king} />
                  ) : null
                }
              </div>
            </>
          ))
        }

      </>
    );
  }
}

export default App;
