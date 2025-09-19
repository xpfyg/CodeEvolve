# CodeEvolve

A powerful code evolution platform that combines AI-driven code generation with modern web technologies. This project aims to streamline the development process by providing intelligent code suggestions, automated refactoring, and collaborative features.

## 🌟 Key Features

- **AI-Powered Code Generation**: Leverage advanced language models to generate high-quality code snippets and complete functions
- **User Authentication System** (New in `feature-user-auth`): 
  - Secure user registration and login
  - JWT-based authentication
  - Role-based access control
  - Password reset functionality
- **Real-time Collaboration**: Work simultaneously with team members on code projects
- **Code Analysis Tools**: Automated code review, syntax checking, and performance optimization suggestions
- **Modern UI**: Responsive frontend built with React and Tailwind CSS
- **Scalable Backend**: Robust architecture supporting multiple AI service integrations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.10+) and pip
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/codeevolve.git
   cd codeevolve
   ```

2. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```

3. Install AI service dependencies
   ```bash
   cd ../ai-service
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

2. Start the AI service (in a separate terminal)
   ```bash
   cd ai-service
   python app.py
   ```

3. Access the application
   - Frontend: `http://localhost:5173`
   - AI Service API: `http://localhost:5000`

## 🔐 User Authentication Usage

With the new user authentication system, you can:

1. Register a new account:
   - Navigate to `/register`
   - Fill in your details and submit
   - Verify your email (if enabled)

2. Log in:
   - Navigate to `/login`
   - Enter your credentials
   - Receive JWT token for authenticated requests

3. Access protected routes:
   - Authenticated users can access `/dashboard`
   - Admin users have additional access to `/admin` panel

## 📁 Project Structure


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions or feedback, please reach out to the team at contact@codeevolve.ai

---

*Last updated: [Current Date]*