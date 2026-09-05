import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import {
  MapPin,
  IndianRupee,
  Maximize2,
  Building,
  Mic,
  MicOff,
  Sparkles,
  Flame,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

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

const quickCities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Jaipur', 'Ahmedabad', 'Chennai', 'Lucknow'];

function SolarInputForm({ token, onResults, onHistoryRefresh }) {
  const [formData, setFormData] = useState({
    city: 'New Delhi',
    monthlyBill: '3500',
    rooftopArea: '600',
    state: 'Delhi',
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setQuickCity = (cityName) => {
    setFormData((prev) => {
      let matchedState = prev.state;
      if (cityName === 'New Delhi') matchedState = 'Delhi';
      else if (cityName === 'Mumbai') matchedState = 'Maharashtra';
      else if (cityName === 'Bengaluru') matchedState = 'Karnataka';
      else if (cityName === 'Jaipur') matchedState = 'Rajasthan';
      else if (cityName === 'Ahmedabad') matchedState = 'Gujarat';
      else if (cityName === 'Chennai') matchedState = 'Tamil Nadu';
      else if (cityName === 'Lucknow') matchedState = 'Uttar Pradesh';
      return { ...prev, city: cityName, state: matchedState };
    });
  };

  const getApiErrorMessage = (error) => {
    if (!error.response) {
      return error.message || 'Unable to connect. Please check your network and try again.';
    }

    const status = error.response.status;
    const backendMessage = error.response.data?.error || error.response.data?.message;

    if (status === 400) {
      return backendMessage || 'Please verify your inputs and try again.';
    }
    if (status === 401) {
      return backendMessage || 'Your session expired, please sign in again.';
    }
    if (status >= 500) {
      return backendMessage || 'Assessment service is initializing. Please try again shortly.';
    }

    return backendMessage || error.message || 'Unable to complete solar calculation.';
  };

  const validateForm = () => {
    const bill = Number(formData.monthlyBill);
    const area = Number(formData.rooftopArea);

    if (!formData.city.trim()) {
      return 'Please enter a city or location.';
    }
    if (!Number.isFinite(bill) || bill <= 0) {
      return 'Monthly electricity bill must be a positive number.';
    }
    if (!Number.isFinite(area) || area <= 0) {
      return 'Rooftop area must be a positive number (sq ft).';
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
      if (word === 'and' || word === 'only') continue;
      if (Object.prototype.hasOwnProperty.call(smallNumbers, word)) {
        current += smallNumbers[word];
      } else if (Object.prototype.hasOwnProperty.call(scales, word)) {
        if (current === 0) current = 1;
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
      setVoiceStatus(`Heard “${transcript}” ➔ Entered ₹${parsed}`);
    } else {
      setVoiceStatus(`Heard “${transcript}” (could not detect clear amount)`);
    }
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) return;
    setVoiceStatus('Listening... say your monthly power bill (e.g. "Three thousand rupees")');
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {}
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return undefined;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          handleVoiceResult(transcript);
        }
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
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          if (typeof recognitionRef.current.abort === 'function') {
            recognitionRef.current.abort();
          } else if (typeof recognitionRef.current.stop === 'function') {
            recognitionRef.current.stop();
          }
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(1);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // Step 1: Open-Meteo Weather lookup
      setLoadingStep(1);
      const weatherResponse = await axios.get(`${API_BASE_URL}/weather`, {
        params: { city: formData.city },
        timeout: 10000,
      });

      const weatherData = weatherResponse.data;
      if (!weatherData || weatherData.error) {
        throw new Error(weatherData?.error || 'Weather lookup failed for that location. Please try another city.');
      }

      // Step 2: Random Forest ML prediction
      setLoadingStep(2);
      const predictionResponse = await axios.post(`${API_BASE_URL}/predict`, {
        temperature: weatherData.temperature,
        cloudcover: weatherData.cloudcover,
        humidity: weatherData.humidity,
        windspeed: weatherData.windspeed,
        radiation: weatherData.radiation,
      }, { timeout: 10000 });

      if (!predictionResponse?.data || predictionResponse.data.error) {
        throw new Error(predictionResponse?.data?.error || 'Prediction calculation failed.');
      }

      // Step 3: ROI & Subsidies calculation
      setLoadingStep(3);
      const roiResponse = await axios.post(`${API_BASE_URL}/calculate-roi`, {
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
        throw new Error(roiResponse?.data?.error || 'Savings calculation failed.');
      }

      // Step 4: Carbon footprint calculation
      setLoadingStep(4);
      const installedCapacity = Number(
        roiResponse.data.required_panel_capacity_kw ||
        roiResponse.data.recommended_capacity_kw ||
        1
      );
      const annualGenerationKwh = installedCapacity * 120.0 * 12.0;

      const carbonResponse = await axios.post(`${API_BASE_URL}/carbon-footprint`, {
        energyOutputKwh: annualGenerationKwh,
      }, { timeout: 10000 });

      // Step 5: Seasonal variation breakdown
      let seasonalBreakdown = [];
      try {
        const seasonalResponse = await axios.get(`${API_BASE_URL}/seasonal-breakdown`, {
          params: { city: formData.city },
          timeout: 10000,
        });
        seasonalBreakdown = seasonalResponse.data.monthly_breakdown || [];
      } catch (seasonalErr) {
        console.warn('Seasonal breakdown request notice:', seasonalErr);
      }

      const results = {
        prediction: predictionResponse.data,
        roi: roiResponse.data,
        carbon: carbonResponse.data || { co2_saved_kg: Math.round(annualGenerationKwh * 0.82), tree_equivalent: Math.round(annualGenerationKwh * 0.82 / 21) },
        seasonalBreakdown,
        userInput: {
          location: formData.city,
          city: formData.city,
          bill: formData.monthlyBill,
          monthlyBill: formData.monthlyBill,
          area: formData.rooftopArea,
          rooftopArea: formData.rooftopArea,
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
        navigate('/login');
      }
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <div className="solar-form-wrapper">
      <form className="solis-control-form" onSubmit={handleSubmit}>
        <div className="form-head-block">
          <div className="form-badge">
            <Sparkles size={13} />
            <span>SOLAR ASSESSMENT CONTROL</span>
          </div>
          <h2 className="form-main-heading">Input Rooftop Parameters</h2>
          <p className="form-sub-heading">
            Our AI engine computes solar irradiance & payback in real-time.
          </p>
        </div>

        {/* Quick City Pills */}
        <div className="quick-city-pills">
          <span className="quick-label">Popular:</span>
          {quickCities.map((c) => (
            <button
              type="button"
              key={c}
              className={`city-pill ${formData.city === c ? 'active' : ''}`}
              onClick={() => setQuickCity(c)}
              disabled={loading}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Input Fields Grid */}
        <div className="form-fields-grid">
          {/* City */}
          <div className="form-group full-width">
            <label htmlFor="city-input">
              <div className="label-title">
                <MapPin size={15} className="label-icon" />
                <span>City / Geographic Location</span>
              </div>
            </label>
            <input
              id="city-input"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. New Delhi, Mumbai, Jaipur"
              required
              disabled={loading}
              className="solis-input"
            />
          </div>

          {/* Monthly Bill */}
          <div className="form-group">
            <label htmlFor="bill-input">
              <div className="label-title">
                <IndianRupee size={15} className="label-icon" />
                <span>Monthly Power Bill (₹)</span>
              </div>
            </label>
            <div className="input-with-action">
              <input
                id="bill-input"
                type="number"
                min="100"
                step="any"
                name="monthlyBill"
                value={formData.monthlyBill}
                onChange={handleChange}
                placeholder="e.g. 3500"
                required
                disabled={loading}
                className="solis-input with-btn"
              />
              {speechSupported && (
                <button
                  type="button"
                  className={`voice-mic-btn ${listening ? 'is-listening' : ''}`}
                  onClick={startVoiceInput}
                  disabled={listening || loading}
                  title="Speak your monthly bill amount"
                  aria-label="Use voice input for electricity bill"
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
            </div>
            {voiceStatus && (
              <span className="form-voice-note">{voiceStatus}</span>
            )}
          </div>

          {/* Rooftop Area */}
          <div className="form-group">
            <label htmlFor="area-input">
              <div className="label-title">
                <Maximize2 size={15} className="label-icon" />
                <span>Rooftop Area (sq ft)</span>
              </div>
            </label>
            <input
              id="area-input"
              type="number"
              min="50"
              step="any"
              name="rooftopArea"
              value={formData.rooftopArea}
              onChange={handleChange}
              placeholder="e.g. 600"
              required
              disabled={loading}
              className="solis-input"
            />
          </div>

          {/* State */}
          <div className="form-group full-width">
            <label htmlFor="state-select">
              <div className="label-title">
                <Building size={15} className="label-icon" />
                <span>State (for Subsidy & Net Metering Policy)</span>
              </div>
            </label>
            <select
              id="state-select"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              disabled={loading}
              className="solis-select"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="solis-btn solis-btn-primary form-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <div className="btn-loading-content">
              <span className="solis-spinner" />
              <span>
                {loadingStep === 1 && 'Querying Solar Satellite Data...'}
                {loadingStep === 2 && 'Executing Random Forest AI Model...'}
                {loadingStep === 3 && 'Calculating 25-Year ROI & Subsidies...'}
                {loadingStep === 4 && 'Synthesizing Carbon Intelligence...'}
                {loadingStep === 0 && 'Analyzing Solar Potential...'}
              </span>
            </div>
          ) : (
            <div className="btn-normal-content">
              <Flame size={18} />
              <span>ANALYZE SOLAR POTENTIAL</span>
              <ArrowRight size={16} />
            </div>
          )}
        </button>

        {/* Error Feedback */}
        {error && (
          <div className="solis-form-error">
            <AlertCircle size={17} className="error-icon" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default SolarInputForm;
