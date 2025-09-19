import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  Mic, 
  Upload, 
  Send, 
  Globe, 
  Bot,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const ReportIssue = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: '',
    images: [],
    isAnonymous: false,
    language: 'english'
  });
  const [isRecording, setIsRecording] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const categories = [
    { id: 'roads', name: 'Roads & Transportation', icon: '🛣️' },
    { id: 'water', name: 'Water & Sanitation', icon: '💧' },
    { id: 'electricity', name: 'Electricity', icon: '⚡' },
    { id: 'environment', name: 'Environment', icon: '🌱' },
    { id: 'public-safety', name: 'Public Safety', icon: '🚨' },
    { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️' }
  ];

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'telugu', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bengali', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'gujarati', name: 'ગુજરાતી', flag: '🇮🇳' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Simulate AI suggestion after title input
    if (field === 'title' && value.length > 10) {
      setTimeout(() => {
        setAiSuggestion({
          category: 'roads',
          priority: 'medium',
          suggestedTags: ['pothole', 'road-maintenance', 'traffic-safety']
        });
      }, 1000);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        setFormData(prev => ({
          ...prev,
          description: prev.description + ' [Voice note recorded and transcribed]'
        }));
      }, 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(4);
    // Simulate form submission
    setTimeout(() => {
      setCurrentStep(5);
    }, 2000);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= step 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
          </div>
          {step < 5 && (
            <div className={`w-16 h-1 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderLanguageSelection = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Select Your Preferred Language
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              handleInputChange('language', lang.code);
              setCurrentStep(2);
            }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
              formData.language === lang.code
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-3xl mb-2">{lang.flag}</div>
            <div className="font-semibold text-gray-900">{lang.name}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderIssueForm = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Report Your Issue
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Briefly describe the issue..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Bot className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">AI Suggestion</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Based on your description, this seems to be a {aiSuggestion.category} issue with {aiSuggestion.priority} priority.
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestion.suggestedTags.map((tag) => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleInputChange('category', category.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  formData.category === category.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-gray-900 text-sm">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <div className="relative">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide detailed information about the issue..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              required
            />
            <button
              type="button"
              onClick={toggleRecording}
              className={`absolute right-3 top-3 p-2 rounded-lg transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>
          {isRecording && (
            <p className="text-sm text-red-600 mt-2 animate-pulse">
              🔴 Recording... Speak clearly about your issue
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter location or use GPS"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <div className="flex space-x-4">
            {[
              { value: 'low', label: 'Low', color: 'text-green-600 border-green-600' },
              { value: 'medium', label: 'Medium', color: 'text-yellow-600 border-yellow-600' },
              { value: 'high', label: 'High', color: 'text-red-600 border-red-600' }
            ].map((priority) => (
              <label key={priority.value} className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="mr-2"
                />
                <span className={`font-medium ${priority.color.split(' ')[0]}`}>
                  {priority.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload images or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>
          {formData.images.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">{formData.images.length} image(s) selected</p>
            </div>
          )}
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.isAnonymous}
            onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
            className="mr-3"
          />
          <label htmlFor="anonymous" className="text-sm text-gray-700">
            Report anonymously (your identity will not be shared)
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 flex items-center"
          >
            Submit Report
            <Send className="ml-2 h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );

  const renderProcessing = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Report</h2>
      <p className="text-gray-600">
        Our AI is analyzing your report and assigning it to the appropriate department...
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Your issue has been assigned ID: <span className="font-semibold text-blue-600">#CC2024001</span>
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your report will be verified within 24 hours</li>
          <li>• You'll receive updates via email/SMS</li>
          <li>• Track progress in your dashboard</li>
        </ul>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setCurrentStep(1);
            setFormData({
              title: '',
              description: '',
              category: '',
              priority: '',
              location: '',
              images: [],
              isAnonymous: false,
              language: 'english'
            });
          }}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Report Another
        </button>
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Track This Issue
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderStepIndicator()}
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && renderLanguageSelection()}
          {currentStep === 2 && renderIssueForm()}
          {currentStep === 4 && renderProcessing()}
          {currentStep === 5 && renderSuccess()}
        </div>

        {/* Chatbot Integration Info */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">Alternative Reporting Methods</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">WhatsApp Bot</h4>
                <p className="text-sm text-green-100">Send "Hi" to +91 9876543210</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Telegram Bot</h4>
                <p className="text-sm text-blue-100">Search @CivicConnectBot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;