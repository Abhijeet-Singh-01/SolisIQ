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
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Leaf,
  ShieldCheck,
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

const solarGoals = [
  { id: 'savings', label: 'Maximum Savings', icon: TrendingUp, desc: 'Cut grid power bills by up to 90%' },
  { id: 'independence', label: 'Energy Independence', icon: ShieldCheck, desc: 'Hedge against annual utility tariff spikes' },
  { id: 'carbon', label: 'Net-Zero Footprint', icon: Leaf, desc: 'Directly eliminate domestic carbon emissions' },
];

function SolarInputForm({ token, onResults, onHistoryRefresh }) {
  const [formData, setFormData] = useState({
    city: 'New Delhi',
    monthlyBill: '3500',
    rooftopArea: '600',
    state: 'Delhi',
    goal: 'savings',
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
      return 'Please enter a city or geographic location.';
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
    setVoiceStatus('Listening... state your average monthly bill in rupees');
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
        setVoiceStatus(`Voice input notice: ${event.error}`);
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
        throw new Error(weatherData?.error || 'Weather telemetry lookup failed for that location. Please verify your city.');
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
        throw new Error(roiResponse?.data?.error || 'Financial savings calculation failed.');
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
        carbon: carbonResponse.data || {
          co2_saved_kg: Math.round(annualGenerationKwh * 0.82),
          tree_equivalent: Math.round(annualGenerationKwh * 0.82 / 21),
        },
        seasonalBreakdown,
        userInput: {
          location: formData.city,
          city: formData.city,
          bill: formData.monthlyBill,
          monthlyBill: formData.monthlyBill,
          area: formData.rooftopArea,
          rooftopArea: formData.rooftopArea,
          state: formData.state,
          goal: formData.goal,
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
    <div className="guided-form-container">
      <form className="guided-advisor-form" onSubmit={handleSubmit}>
        {/* Editorial Section Header */}
        <div className="guided-form-header">
          <span className="guided-mono-kicker">STEP-BY-STEP ADVISOR</span>
          <h2 className="guided-main-title">Let's understand your home.</h2>
          <p className="guided-subtext">
            Configure your property parameters to generate a precision machine learning forecast.
          </p>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: LOCATION                                         */}
        {/* ======================================================== */}
        <div className="form-guided-step">
          <div className="step-tag-row">
            <span className="step-mono-badge">01</span>
            <span className="step-name">LOCATION & CLIMATE</span>
          </div>
          <h3 className="step-question">Where is your property located?</h3>

          <div className="form-field-group">
            <label htmlFor="city-input" className="sr-only">City</label>
            <div className="input-affix-wrap">
              <MapPin size={16} className="input-icon" />
              <input
                id="city-input"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. New Delhi, Mumbai, Jaipur"
                required
                disabled={loading}
                className="solis-editorial-input"
              />
            </div>

            {/* Popular quick-select pills */}
            <div className="quick-city-strip">
              <span className="strip-label">Popular cities:</span>
              <div className="strip-pills">
                {quickCities.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`city-select-pill ${formData.city === c ? 'active' : ''}`}
                    onClick={() => setQuickCity(c)}
                    disabled={loading}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEP 2: ROOFTOP SPACE                                    */}
        {/* ======================================================== */}
        <div className="form-guided-step">
          <div className="step-tag-row">
            <span className="step-mono-badge">02</span>
            <span className="step-name">ROOFTOP DIMENSIONS</span>
          </div>
          <h3 className="step-question">How much usable space can we use?</h3>

          <div className="form-field-group">
            <label htmlFor="area-input" className="sr-only">Rooftop Area</label>
            <div className="input-affix-wrap">
              <Maximize2 size={16} className="input-icon" />
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
                className="solis-editorial-input"
              />
              <span className="input-suffix">sq ft</span>
            </div>
            <p className="input-help-text">
              Include flat roof or pitched south-facing surfaces without significant tree or building shadows.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEP 3: ENERGY BILL                                      */}
        {/* ======================================================== */}
        <div className="form-guided-step">
          <div className="step-tag-row">
            <span className="step-mono-badge">03</span>
            <span className="step-name">ENERGY CONSUMPTION</span>
          </div>
          <h3 className="step-question">What is your average monthly electricity bill?</h3>

          <div className="form-field-group">
            <label htmlFor="bill-input" className="sr-only">Monthly Electricity Bill</label>
            <div className="input-affix-wrap">
              <IndianRupee size={16} className="input-icon" />
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
                className="solis-editorial-input with-mic"
              />
              {speechSupported && (
                <button
                  type="button"
                  className={`voice-record-btn ${listening ? 'listening' : ''}`}
                  onClick={startVoiceInput}
                  disabled={listening || loading}
                  title="Speak bill amount"
                  aria-label="Use voice input for electricity bill"
                >
                  {listening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              )}
            </div>
            {voiceStatus && (
              <span className="voice-status-note">{voiceStatus}</span>
            )}
            <p className="input-help-text">
              Used to calculate current tariff slabs, offset ratio, and 25-year cumulative inflation hedges.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEP 4: STATE POLICY & SUBSIDIES                         */}
        {/* ======================================================== */}
        <div className="form-guided-step">
          <div className="step-tag-row">
            <span className="step-mono-badge">04</span>
            <span className="step-name">POLICY & SUBSIDY GRANTS</span>
          </div>
          <h3 className="step-question">Which state policy applies to your property?</h3>

          <div className="form-field-group">
            <label htmlFor="state-select" className="sr-only">State</label>
            <div className="input-affix-wrap">
              <Building size={16} className="input-icon" />
              <select
                id="state-select"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                disabled={loading}
                className="solis-editorial-select"
              >
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st} State Solar Policy & Net Metering
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEP 5: PRIMARY OBJECTIVE                                */}
        {/* ======================================================== */}
        <div className="form-guided-step">
          <div className="step-tag-row">
            <span className="step-mono-badge">05</span>
            <span className="step-name">PRIMARY GOAL</span>
          </div>
          <h3 className="step-question">What do you want most from solar?</h3>

          <div className="goals-options-grid">
            {solarGoals.map((g) => {
              const IconComp = g.icon;
              const isSelected = formData.goal === g.id;
              return (
                <button
                  type="button"
                  key={g.id}
                  className={`goal-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, goal: g.id }))}
                  disabled={loading}
                >
                  <div className="goal-card-top">
                    <IconComp size={16} className="goal-icon" />
                    <strong>{g.label}</strong>
                  </div>
                  <p className="goal-card-desc">{g.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="guided-form-actions">
          <button
            type="submit"
            className="solis-btn solis-btn-primary form-cta-btn"
            disabled={loading}
          >
            {loading ? (
              <div className="btn-loading-state">
                <span className="solis-spinner" />
                <span>
                  {loadingStep === 1 && 'Querying satellite radiation data...'}
                  {loadingStep === 2 && 'Executing Random Forest AI model...'}
                  {loadingStep === 3 && 'Calculating 25-year financial payback...'}
                  {loadingStep === 4 && 'Synthesizing carbon offsets...'}
                  {loadingStep === 0 && 'Analyzing rooftop potential...'}
                </span>
              </div>
            ) : (
              <div className="btn-ready-state">
                <span>Calculate My Solar Potential</span>
                <ArrowRight size={15} />
              </div>
            )}
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="editorial-form-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default SolarInputForm;
