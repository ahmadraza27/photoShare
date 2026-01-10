import React from 'react';
import { Mail, PenTool, User, Lock } from 'lucide-react';
// import '../styles/contact-us.css';

function ContactUs() {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-title">Become a Creator</h1>

        <p className="contact-description">
          If you want to become a creator on our platform, we would love to hear
          from you.
        </p>

        <p className="contact-description">
          Please send us an email with the following information:
        </p>

        <div className="contact-info-list">
          <div className="info-item">
            <PenTool size={18} />
            <span>Your inspiration and why you want to create content</span>
          </div>

          <div className="info-item">
            <User size={18} />
            <span>Your experience in photography or creative work</span>
          </div>

          <div className="info-item">
            <User size={18} />
            <span>Your preferred username</span>
          </div>

          <div className="info-item">
            <Lock size={18} />
            <span>
              A temporary password (for initial stages of the project only)
            </span>
          </div>
        </div>

        <div className="email-box">
          <Mail size={20} />
          <a href="mailto:haider-mh1@ulster.ac.uk">
            haider-mh1@ulster.ac.uk
          </a>
        </div>

        <p className="contact-note">
          ⚠️ Credentials shared via email are only used for initial testing and
          will be changed later.
        </p>
      </div>
    </div>
  );
}

export default ContactUs;
