import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const states = [
  'Delhi',
  'Maharashtra',
  'Gujarat',
  'Tamil Nadu',
  'Karnataka',
  'Uttar Pradesh',
  'Rajasthan',
  'Punjab',
];

function SolarInputForm({ token, onResults, onHistoryRefresh }) {
  const [formData, setFormData] = useState({
    city: 'New Delhi',
    monthlyBill: '',
    rooftopArea: '',
    state: 'Delhi',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getApiErrorMessage = (error) => {
    if (!error.response) {
      return error.message || 'Unable to connect. Please check your connection and try again.';
    }

    const status = error.response.status;
    const backendMessage = error.response.data?.error;

    if (status === 400) {
      return backendMessage || 'Please check your inputs and try again.';
    }
    if (status === 401) {
      return backendMessage || 'Your session expired, please log in again.';
    }
    if (status >= 500) {
      return backendMessage || 'Something went wrong on our end. Please try again shortly.';
    }

    return backendMessage || error.message || 'Something went wrong. Please try again.';
  };

  const validateForm = () => {
    const bill = Number(formData.monthlyBill);
    const area = Number(formData.rooftopArea);

    if (!formData.city.trim()) {
      return 'Please enter a city or location.';
    }
    if (!Number.isFinite(bill) || bill <= 0) {
      return 'Monthly bill must be a positive number.';
    }
    if (!Number.isFinite(area) || area <= 0) {
      return 'Rooftop area must be a positive number.';
    }
    return '';
  };

  const parseSpokenNumber = (speechText) => {
    const normalized = speechText
      .toLowerCase()
      .replace(/rupees?|rs\.?|₹/g, ' ')
      .replace(/[^a-z0-9\.\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const explicit = normalized.match(/-?\d+(?:[\.,]\d+)?/);
    if (explicit) {
      return Number(explicit[0].replace(',', '.'));
    }

    const words = normalized.split(' ');
    const smallNumbers = {
      zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
      ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
      seventeen: 17, eighteen: 18, nineteen: 19,
      twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
    };
    const scales = {
      hundred: 100,
      thousand: 1000,
      lakh: 100000,
      million: 1000000,
    };

    let total = 0;
    let current = 0;

    for (const word of words) {
      if (word === 'and' || word === 'only') {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(smallNumbers, word)) {
        current += smallNumbers[word];
      } else if (Object.prototype.hasOwnProperty.call(scales, word)) {
        if (current === 0) {
          current = 1;
        }
        current *= scales[word];
        total += current;
        current = 0;
      } else {
        const maybeNumber = Number(word);
        if (!Number.isNaN(maybeNumber)) {
          current += maybeNumber;
        }
      }
    }

    total += current;
    return total > 0 ? total : null;
  };

  const handleVoiceResult = (transcript) => {
    const parsed = parseSpokenNumber(transcript);
    if (parsed && Number.isFinite(parsed)) {
      setFormData((prev) => ({ ...prev, monthlyBill: String(parsed) }));
      setVoiceStatus(`Heard “${transcript}”, entered ₹${parsed}`);
    } else {
      setVoiceStatus(`Heard “${transcript}”, could not parse a clear number.`);
    }
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      return;
    }

    setVoiceStatus('Listening... please say the monthly bill amount.');
    setListening(true);
    recognitionRef.current.start();
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleVoiceResult(transcript);
    };

    recognition.onerror = (event) => {
      setVoiceStatus(`Voice input error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const weatherResponse = await axios.get('http://127.0.0.1:5000/weather', {
        params: { city: formData.city },
        timeout: 10000,
      });

      const weatherData = weatherResponse.data;
      if (!weatherData || weatherData.error) {
        throw new Error(weatherData?.error || 'Weather lookup failed for that location. Please try another city.');
      }

      const predictionResponse = await axios.post('http://127.0.0.1:5000/predict', {
        temperature: weatherData.temperature,
        cloudcover: weatherData.cloudcover,
        humidity: weatherData.humidity,
        windspeed: weatherData.windspeed,
        radiation: weatherData.radiation,
      }, { timeout: 10000 });

      if (!predictionResponse?.data || predictionResponse.data.error) {
        throw new Error(predictionResponse?.data?.error || 'Prediction failed. Please try again.');
      }

      const roiResponse = await axios.post('http://127.0.0.1:5000/calculate-roi', {
        monthlyBill: Number(formData.monthlyBill),
        rooftopArea: Number(formData.rooftopArea),
        tariffRate: 7,
        state: formData.state,
        city: formData.city,
        predicted_output: predictionResponse.data.predicted_energy_output_kwh,
      }, {
        timeout: 10000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!roiResponse?.data || roiResponse.data.error) {
        throw new Error(roiResponse?.data?.error || 'Savings calculation failed. Please try again.');
      }

      const carbonResponse = await axios.post('http://127.0.0.1:5000/carbon-footprint', {
        energyOutputKwh: predictionResponse.data.predicted_energy_output_kwh,
      }, { timeout: 10000 });

      if (!carbonResponse?.data || carbonResponse.data.error) {
        throw new Error(carbonResponse?.data?.error || 'Carbon footprint calculation failed. Please try again.');
      }

      let seasonalBreakdown = [];
      try {
        const seasonalResponse = await axios.get('http://127.0.0.1:5000/seasonal-breakdown', {
          params: { city: formData.city },
          timeout: 10000,
        });
        seasonalBreakdown = seasonalResponse.data.monthly_breakdown || [];
      } catch (seasonalErr) {
        console.warn('Seasonal breakdown request failed', seasonalErr);
      }

      const results = {
        prediction: predictionResponse.data,
        roi: roiResponse.data,
        carbon: carbonResponse.data,
        seasonalBreakdown,
        userInput: {
          location: formData.city,
          bill: formData.monthlyBill,
          area: formData.rooftopArea,
          state: formData.state,
        },
      };

      onResults(results);
      if (typeof onHistoryRefresh === 'function') {
        onHistoryRefresh();
      }
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="solar-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>Solar Assessment</h2>
        <p>Estimate your rooftop solar potential in seconds.</p>
      </div>

      <label className="full-width">
        City / Location
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </label>

      <label>
        Monthly Electricity Bill (₹)
        <div className="input-with-icon">
          <input
            type="number"
            min="0"
            step="any"
            name="monthlyBill"
            value={formData.monthlyBill}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {speechSupported && (
            <button
              type="button"
              className="voice-input-btn"
              onClick={startVoiceInput}
              disabled={listening}
              aria-label="Use voice input for monthly bill"
            >
              {listening ? '🎙️' : '🎙️'}
            </button>
          )}
        </div>
        <p className="voice-message">
          {speechSupported
            ? voiceStatus
            : 'Voice input not available in this browser.'}
        </p>
      </label>

      <label>
        Rooftop Area (sq ft)
        <input
          type="number"
          min="0"
          step="any"
          name="rooftopArea"
          value={formData.rooftopArea}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </label>

      <label>
        State
        <select name="state" value={formData.state} onChange={handleChange} required disabled={loading}>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <button className="full-width" type="submit" disabled={loading}>
        {loading ? 'Analyzing your solar potential...' : 'Analyze Solar Potential'}
      </button>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
}

export default SolarInputForm;
