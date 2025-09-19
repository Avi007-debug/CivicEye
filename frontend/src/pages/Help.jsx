import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Phone, 
  Mail,
  ExternalLink,
  BookOpen,
  HelpCircle,
  FileText,
  Users
} from 'lucide-react';

const Help = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqs = [
    {
      question: "How do I report a civic issue?",
      answer: "You can report a civic issue by clicking the 'Report Issue' button in the navigation menu. Fill out the form with details about the issue, upload photos if available, and select the appropriate category. The system will automatically detect your location or you can manually enter it."
    },
    {
      question: "How can I track my reported issues?",
      answer: "Go to the 'Track Issue' page and enter your issue ID or search using keywords. You can also view all your reported issues in your dashboard. Each issue shows its current status, timeline, and any updates from the relevant department."
    },
    {
      question: "What is the typical resolution time for issues?",
      answer: "Resolution times vary by issue type and priority. High-priority issues are typically addressed within 24-48 hours, medium priority within 3-7 days, and low priority within 2-4 weeks. You'll receive notifications about any updates."
    },
    {
      question: "Can I report issues anonymously?",
      answer: "Yes, you can choose to report issues anonymously by checking the 'Report anonymously' option when submitting your report. However, we recommend providing your contact information so we can update you on the progress."
    },
    {
      question: "How does the upvoting system work?",
      answer: "The upvoting system allows citizens to show support for reported issues. Issues with more upvotes get higher priority. You can upvote any public issue once, and this helps authorities understand which problems affect more people."
    },
    {
      question: "What happens after I submit an issue?",
      answer: "After submission, your issue goes through verification by our team, then gets assigned to the relevant department. You'll receive a unique tracking ID and email notifications at each stage of the process."
    },
    {
      question: "How do I use voice reporting?",
      answer: "When filling out the issue description, click the microphone icon and speak clearly about the problem. The system will transcribe your voice to text automatically. Make sure to grant microphone permissions to your browser."
    },
    {
      question: "Can I report issues in my local language?",
      answer: "Yes, CivicConnect supports multiple languages including Hindi, Tamil, Telugu, Bengali, and Gujarati. Select your preferred language at the beginning of the reporting process."
    },
    {
      question: "What if my issue is not resolved within the estimated time?",
      answer: "If your issue exceeds the estimated resolution time, you can escalate it by contacting our support team or using the escalation feature in your dashboard. We'll follow up with the relevant department."
    },
    {
      question: "How can I contact support?",
      answer: "You can contact our support team via email at support@civicconnect.gov.in, call our helpline at 1800-123-4567, or use the live chat feature available 24/7 on our website."
    }
  ];

  const guides = [
    {
      title: "Getting Started with CivicConnect",
      description: "A comprehensive guide to help you get started with reporting and tracking civic issues.",
      icon: <BookOpen className="h-8 w-8" />,
      color: "bg-blue-500"
    },
    {
      title: "How to Report Effective Issues",
      description: "Best practices for reporting issues that get quick resolution from authorities.",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-green-500"
    },
    {
      title: "Understanding Issue Status",
      description: "Learn about different issue statuses and what they mean for your reported problems.",
      icon: <HelpCircle className="h-8 w-8" />,
      color: "bg-orange-500"
    },
    {
      title: "Community Guidelines",
      description: "Guidelines for respectful and effective community participation in civic issues.",
      icon: <Users className="h-8 w-8" />,
      color: "bg-purple-500"
    }
  ];

  const contactMethods = [
    {
      title: "Phone Support",
      description: "Call our 24/7 helpline",
      contact: "1800-123-4567",
      icon: <Phone className="h-6 w-6" />,
      color: "bg-green-500"
    },
    {
      title: "Email Support",
      description: "Send us an email",
      contact: "support@civicconnect.gov.in",
      icon: <Mail className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 24/7",
      icon: <MessageCircle className="h-6 w-6" />,
      color: "bg-purple-500"
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const renderFAQ = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search frequently asked questions..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
              onClick={() => toggleFaq(index)}
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              {openFaqIndex === index ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {openFaqIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
          <p className="text-gray-600">Try searching with different keywords or contact support.</p>
        </div>
      )}
    </div>
  );

  const renderGuides = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {guides.map((guide, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <div className="flex items-start space-x-4">
            <div className={`${guide.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-200`}>
              {guide.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {guide.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{guide.description}</p>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                <span>Read more</span>
                <ExternalLink className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContact = () => (
    <div className="space-y-8">
      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-6">
        {contactMethods.map((method, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-200">
            <div className={`${method.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mx-auto mb-4`}>
              {method.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{method.description}</p>
            <p className="text-blue-600 font-medium">{method.contact}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your email"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Message subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your message"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Need Immediate Help?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Emergency Issues</h4>
            <p className="text-blue-100 text-sm mb-2">For urgent civic issues that need immediate attention</p>
            <button className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition-colors duration-200">
              Report Emergency
            </button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Technical Support</h4>
            <p className="text-blue-100 text-sm mb-2">Having trouble using the platform?</p>
            <button className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition-colors duration-200">
              Get Tech Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to your questions and get help with using CivicConnect
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'faq', name: 'Frequently Asked Questions', icon: <HelpCircle className="h-5 w-5" /> },
              { id: 'guides', name: 'Guides & Tutorials', icon: <BookOpen className="h-5 w-5" /> },
              { id: 'contact', name: 'Contact Support', icon: <MessageCircle className="h-5 w-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'faq' && renderFAQ()}
          {activeTab === 'guides' && renderGuides()}
          {activeTab === 'contact' && renderContact()}
        </div>
      </div>
    </div>
  );
};

export default Help;