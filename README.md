# Master Chef AI 🍳

## Introduction

โครงการ Master Chef AI มีเป้าหมายเพื่อพัฒนาเว็บแอปพลิเคชันที่ช่วยผู้ใช้ในการสร้างและจัดการสูตรอาหาร โดยอาศัยความสามารถของ AI ผ่าน LLM API ในการแปลงอินพุตจากผู้ใช้ ไม่ว่าจะเป็นการอัปโหลดรูปภาพอาหารหรือการพิมพ์ข้อความอธิบายเมนู ให้กลายเป็นสูตรอาหารที่สมบูรณ์ ประกอบด้วยรายการวัตถุดิบ ขั้นตอนการทำทีละขั้น และคำอธิบายประกอบ ผู้ใช้ยังสามารถบันทึกสูตรที่ตนสนใจไว้ในระบบเพื่อใช้งานซ้ำในอนาคตได้

ระบบถูกพัฒนาขึ้นในรูปแบบ Single-page Web Application (SPA) โดยมีโครงสร้างหน้าเว็บเพียงหน้าเดียว แต่สามารถสลับมุมมองการใช้งานได้หลากหลายผ่าน Navigation Tabs ได้แก่ Chat & Upload, Recipe และ Saved โดยไม่ต้องโหลดหน้าใหม่ ระบบนี้ใช้เทคนิค hash-routing และการจัดการ DOM เพื่อให้ผู้ใช้โต้ตอบได้รวดเร็วต่อเนื่องในด้านประสบการณ์ใช้งาน (User Experience, UX) เว็บถูกออกแบบให้เข้าใจง่ายตั้งแต่ส่วนหัวของหน้าเว็บ (Header) ซึ่งประกอบด้วยโลโก้สัญลักษณ์ 🍳 และชื่อโครงการ Master Chef AI พร้อมคำบรรยายสั้น ๆ ว่า "Upload food images, chat with AI, get recipes with step-by-step instructions and save your favorites" เพื่อสื่อสารถึงฟังก์ชันหลักทั้งหมดของระบบอย่างชัดเจน

การออกแบบส่วนติดต่อผู้ใช้ (User Interface, UI) ใช้โทนสีอ่อนและสบายตา โดยมีพื้นหลังโทนเทาอ่อน (#f8f9fa), ข้อความสีเข้ม (#2d3748), และปุ่มแบบโค้งมนเพื่อสร้างความรู้สึกทันสมัยและเป็นมิตรต่อผู้ใช้ นอกจากนี้ยังมีการกำหนด Responsive Design ผ่าน CSS Media Queries เพื่อให้ใช้งานได้ราบรื่นบนอุปกรณ์ทุกประเภท ตั้งแต่สมาร์ตโฟน แท็บเล็ต ไปจนถึงคอมพิวเตอร์ตั้งโต๊ะ

กล่าวโดยสรุป โครงการนี้นำเสนอการผสมผสานระหว่าง นวัตกรรม AI และ เทคนิคการพัฒนาเว็บที่ทันสมัย โดยเน้นทั้งความสะดวกในการใช้งาน ความรวดเร็วในการตอบสนอง และความสามารถในการปรับตัวเข้ากับอุปกรณ์ที่หลากหลาย ตรงตามโจทย์ที่กำหนดให้พัฒนาเป็น SPA ที่ใช้งานได้จริงและรองรับผู้ใช้ทั่วไป

## วัตถุประสงค์ของโครงการ (Objectives)

โครงการ Master Chef AI ถูกกำหนดขึ้นโดยมีวัตถุประสงค์หลัก 4 ประการ ซึ่งแต่ละข้อไม่เพียงเป็นเป้าหมายในการพัฒนาเท่านั้น แต่ยังสะท้อนถึงความสำคัญของระบบในเชิงการใช้งานจริง

## Features

- 🤖 **AI-Powered Recipe Generation**: Generate recipes from text descriptions or food images
- 📸 **Image Recognition**: Upload food images to get recipe suggestions
- 💬 **Chat Interface**: Interactive chat with AI chef for recipe requests
- 📝 **Recipe Management**: Save, edit, and delete your favorite recipes
- 🔍 **Recipe Filtering**: Filter saved recipes by cooking time
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

### Frontend
- **HTML5/CSS3/JavaScript (ES6+)**
- **Single Page Application (SPA)** with tab-based navigation
- **Responsive Design** with CSS Grid and Flexbox
- **File Upload** with drag-and-drop support

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **OpenRouter API** for LLM integration
- **RESTful API** architecture

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- OpenRouter API key

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd KrungSri
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/masterchef
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3222
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Recipes
- `GET /recipes` - Get all recipes (with optional time filter: `?time=30`)
- `POST /recipes` - Create a new recipe
- `PUT /recipes/:id` - Update an existing recipe
- `DELETE /recipes/:id` - Delete a recipe

### AI Features
- `POST /recipes/chef` - Generate recipe from text
  ```json
  {
    "foodName": "Pad Thai"
  }
  ```

- `POST /recipes/chef-image` - Generate recipe from image
  ```json
  {
    "base64Image": "base64_encoded_image_data"
  }
  ```

## Recipe Data Structure

```json
{
  "name": "Recipe Name",
  "time": 30,
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "1 cup",
      "unit": "cup"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "description": "Step description"
    }
  ],
  "nutrition": {
    "calories": 200,
    "carbs": 25,
    "fat": 8,
    "protein": 4
  }
}
```

## Usage

### 1. Generate Recipe from Text
1. Go to "Chat & Upload" tab
2. Type a food name in the chat input
3. Click "Send" or press Enter
4. AI will generate a complete recipe
5. Click "Save" to store the recipe

### 2. Generate Recipe from Image
1. Go to "Chat & Upload" tab
2. Drag and drop an image or click to upload
3. Click "Generate Recipe from Image"
4. AI will identify the food and create a recipe
5. Click "Save" to store the recipe

### 3. Manage Saved Recipes
1. Go to "Saved" tab to view all saved recipes
2. Use time filter to find recipes by cooking time
3. Click on any recipe to view details
4. Use "Edit" button to modify recipe name and ingredients
5. Use "Delete" button to remove recipes

## Configuration

### OpenRouter Setup
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Add it to your `.env` file as `OPENROUTER_API_KEY`

### MongoDB Setup
- **Local**: Install MongoDB and use `mongodb://localhost:27017/masterchef`
- **Cloud**: Use MongoDB Atlas and update the connection string

## Default Behavior

If the AI doesn't recognize a food name, it will automatically generate a **PadKrapao** recipe with the name "Default Food Suggestion Because Your Food Doesn't Exist - PadKrapao".

## Project Structure

```
KrungSri/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── scripts/
│   │   ├── index.html
│   │   └── styles.css
│   ├── package.json
│   └── server.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
