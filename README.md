<!DOCTYPE html>
<html lang="en">

</head>
<body>

<h1>TechnoLab Market</h1>

<p align="center">
  <img src="https://media.giphy.com/media/2C6v4QD5d3YOO4YhID/giphy.gif?cid=790b7611rff6lh11cp2z9sgdww5hkce4fidb09zaxbow75ac&ep=v1_gifs_search&rid=giphy.gif&ct=g" alt="Welcome GIF">
</p>



    
</p>

<p align="center">Welcome to <strong>TechnoLab Market</strong>! This web application serves as a marketplace platform, enabling users to browse, search, and purchase a variety of products. 🛍️</p>

<h2>Features</h2>
<ul>
    <li>🛒 <strong>Product Listings</strong>: View detailed information about available products, including images, descriptions, and prices.</li>
    <li>🔍 <strong>Search Functionality</strong>: Easily find products using the search bar.</li>
    <li>🔐 <strong>User Authentication</strong>: Registration and login, with passwords hashed using bcrypt.</li>
    <li>🏷️ <strong>Sell Your Own Prints</strong>: List an item with a photo, condition, material and price.</li>
    <li>💰 <strong>Offers</strong>: Place offers on other sellers' listings; sellers review and accept them.</li>
    <li>⭐ <strong>Seller Profiles &amp; Reviews</strong>: Browse a seller's listings and leave a star rating.</li>
</ul>

<h2>Tech Stack</h2>
<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML5" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" alt="CSS3" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" alt="Express.js" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/ejs/ejs-original.svg" alt="EJS" width="40" height="40"/>
</p>


<h2>Installation</h2>
<ol>
    <li>📥 <strong>Clone the Repository</strong>:
        <pre><code>git clone https://github.com/Ialzouby/TechnoLab-Market.git</code></pre>
    </li>
    <li>📂 <strong>Navigate to the Project Directory</strong>:
        <pre><code>cd TechnoLab-Market</code></pre>
    </li>
    <li>📦 <strong>Install Dependencies</strong>:
        <pre><code>npm install</code></pre>
    </li>
    <li>🚀 <strong>Start the Application</strong>:
        <pre><code>npm start</code></pre>
        <p>The application will run at <code>http://localhost:3000</code>. No database setup required.</p>
    </li>
</ol>

<h2>Demo Data</h2>
<p>The app runs entirely on in-memory sample data, loaded from <code>data/seed.js</code> when the server starts: 4 sellers, 9 listings, offers and reviews. There is no database to configure, and nothing to connect to.</p>

<p>Because the data lives in memory, <strong>anything you add during a session disappears when the server restarts</strong>. That includes new accounts, listings and offers. Restarting is how you reset the demo back to its starting state.</p>

<p>Sign in with any of these accounts — the password for all of them is <code>password123</code>:</p>
<ul>
    <li><code>issam@technolab.com</code> — has listings, offers placed, and one accepted offer ready to pay</li>
    <li><code>maya@technolab.com</code></li>
    <li><code>diego@technolab.com</code></li>
    <li><code>priya@technolab.com</code></li>
</ul>

<p>Uploaded images are written to <code>public/images</code>. On a hosted platform with an ephemeral filesystem, those uploads are also lost on restart.</p>

<h2>Usage</h2>
<ul>
    <li>🏠 <strong>Home Page</strong>: Browse featured products.</li>
    <li>📄 <strong>Product Page</strong>: Click on a product to view its details.</li>
    <li>🔍 <strong>Search &amp; Filter</strong>: Search by keyword, or filter by material and condition.</li>
    <li>💰 <strong>Make an Offer</strong>: Log in and bid on any active listing you don't own.</li>
    <li>👤 <strong>My Account</strong>: Manage your listings, and track the offers you've placed.</li>
</ul>

<h2>Contributing</h2>
<p>Contributions are welcome! Please fork the repository and create a pull request with your changes. 🤝</p>

<h2>License</h2>
<p>This project is licensed under the MIT License. 📄</p>

<h2>Acknowledgments</h2>
<p>This project was developed as a solo endeavor for the ITIS 4166 class. Special thanks to the course instructors and peers for their support and guidance. 🎓</p>

<p align="center">
    <img src="https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif" alt="Thank You GIF" class="gif">
</p>

</body>
</html>
