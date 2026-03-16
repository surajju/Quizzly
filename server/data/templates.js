export const templates = [
  {
    id: 'general-knowledge',
    title: 'General Knowledge',
    category: 'Trivia',
    icon: '🧠',
    description: 'Test your general knowledge with these classic trivia questions',
    questions: [
      { text: 'What is the largest planet in our solar system?', options: ['Earth', 'Jupiter', 'Saturn', 'Mars'], correctIndex: 1, timeLimit: 15 },
      { text: 'Who painted the Mona Lisa?', options: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Michelangelo'], correctIndex: 2, timeLimit: 15 },
      { text: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correctIndex: 2, timeLimit: 15 },
      { text: 'Which country has the most natural lakes?', options: ['USA', 'Brazil', 'Canada', 'Russia'], correctIndex: 2, timeLimit: 20 },
      { text: 'What year did the Titanic sink?', options: ['1905', '1912', '1920', '1898'], correctIndex: 1, timeLimit: 15 },
      { text: 'How many bones are in the adult human body?', options: ['186', '206', '226', '196'], correctIndex: 1, timeLimit: 20 },
    ]
  },
  {
    id: 'science',
    title: 'Science & Nature',
    category: 'Science',
    icon: '🔬',
    description: 'From physics to biology — how well do you know science?',
    questions: [
      { text: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], correctIndex: 2, timeLimit: 15 },
      { text: 'What gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctIndex: 1, timeLimit: 15 },
      { text: 'What is the speed of light approximately?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'], correctIndex: 0, timeLimit: 20 },
      { text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], correctIndex: 1, timeLimit: 10 },
      { text: 'What is the smallest unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Organ'], correctIndex: 2, timeLimit: 15 },
      { text: 'What force keeps planets in orbit around the Sun?', options: ['Magnetism', 'Friction', 'Gravity', 'Inertia'], correctIndex: 2, timeLimit: 15 },
    ]
  },
  {
    id: 'geography',
    title: 'World Geography',
    category: 'Geography',
    icon: '🌍',
    description: 'How well do you know our planet?',
    questions: [
      { text: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'], correctIndex: 1, timeLimit: 15 },
      { text: 'Which continent is the Sahara Desert on?', options: ['Asia', 'South America', 'Africa', 'Australia'], correctIndex: 2, timeLimit: 10 },
      { text: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctIndex: 2, timeLimit: 15 },
      { text: 'Which ocean is the largest?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctIndex: 3, timeLimit: 15 },
      { text: 'Mount Everest is located in which mountain range?', options: ['Andes', 'Alps', 'Himalayas', 'Rockies'], correctIndex: 2, timeLimit: 15 },
      { text: 'What is the smallest country in the world?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], correctIndex: 1, timeLimit: 20 },
    ]
  },
  {
    id: 'movies',
    title: 'Movies & Pop Culture',
    category: 'Entertainment',
    icon: '🎬',
    description: 'Test your knowledge of movies, TV, and pop culture',
    questions: [
      { text: 'Who directed the movie "Inception"?', options: ['Steven Spielberg', 'Christopher Nolan', 'James Cameron', 'Martin Scorsese'], correctIndex: 1, timeLimit: 15 },
      { text: 'What fictional city is Batman from?', options: ['Metropolis', 'Star City', 'Gotham City', 'Central City'], correctIndex: 2, timeLimit: 10 },
      { text: 'Which movie features the quote "I\'ll be back"?', options: ['Rambo', 'Die Hard', 'RoboCop', 'The Terminator'], correctIndex: 3, timeLimit: 15 },
      { text: 'What is the highest-grossing film of all time?', options: ['Avengers: Endgame', 'Avatar', 'Titanic', 'Star Wars: The Force Awakens'], correctIndex: 1, timeLimit: 20 },
      { text: 'In "The Matrix", what color pill does Neo take?', options: ['Blue', 'Red', 'Green', 'Yellow'], correctIndex: 1, timeLimit: 10 },
      { text: 'Who played Jack in Titanic?', options: ['Brad Pitt', 'Tom Cruise', 'Leonardo DiCaprio', 'Johnny Depp'], correctIndex: 2, timeLimit: 10 },
    ]
  },
  {
    id: 'tech',
    title: 'Tech & Programming',
    category: 'Technology',
    icon: '💻',
    description: 'How much do you know about technology and coding?',
    questions: [
      { text: 'Who is the co-founder of Microsoft?', options: ['Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos'], correctIndex: 1, timeLimit: 15 },
      { text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Media Language'], correctIndex: 0, timeLimit: 20 },
      { text: 'In which year was the first iPhone released?', options: ['2005', '2006', '2007', '2008'], correctIndex: 2, timeLimit: 15 },
      { text: 'What programming language is known as the "language of the web"?', options: ['Python', 'Java', 'JavaScript', 'C++'], correctIndex: 2, timeLimit: 15 },
      { text: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correctIndex: 0, timeLimit: 15 },
      { text: 'Which company created the Android operating system?', options: ['Apple', 'Google', 'Microsoft', 'Samsung'], correctIndex: 1, timeLimit: 15 },
    ]
  }
]
