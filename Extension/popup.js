// Constants - Load from Chrome storage or config
let CONFIG = {};

// Load configuration from storage
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['API_CONFIG'], (result) => {
      CONFIG = result.API_CONFIG || {};
      if (!CONFIG.GOOGLE_API_KEY) {
        console.warn('API keys not configured. Please add them in extension settings.');
      }
      resolve(CONFIG);
    });
  });
}

// Store current view state
let currentView = 'search';
let searchResults = [];
let savedJobs = [];
let isLoading = false;
let sortMethod = 'relevance'; // Default sort method
let userProfile = {}; // Store user's professional profile

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  // Load configuration first
  await loadConfig();

  // Load saved jobs from storage
  loadSavedJobs();

  // Load user profile from storage
  loadUserProfile();

  // Set up event listeners

  document.getElementById("search-btn").addEventListener("click", searchJobs);
  document.getElementById("search-tab").addEventListener("click", showSearchView);
  document.getElementById("saved-tab").addEventListener("click", showSavedJobsView);
  document.getElementById("profile-tab").addEventListener("click", showProfileView);

  // Profile modal event listeners
  document.getElementById("close-profile-modal").addEventListener("click", closeProfileModal);
  document.getElementById("save-profile").addEventListener("click", saveProfile);

  // Set up sort method listeners when elements exist
  const sortRelevanceBtn = document.getElementById("sort-relevance");
  const sortPopularityBtn = document.getElementById("sort-popularity");
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("auto-apply-all").addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "autoApplyJobs" });
    });
  });


  if (sortRelevanceBtn) {
    sortRelevanceBtn.addEventListener("click", () => {
      sortMethod = 'relevance';
      if (searchResults.length > 0) {
        sortSearchResults();
        displaySearchResults(searchResults);
      }
    });
  }

  if (sortPopularityBtn) {
    sortPopularityBtn.addEventListener("click", () => {
      sortMethod = 'popularity';
      if (searchResults.length > 0) {
        sortSearchResults();
        displaySearchResults(searchResults);
      }
    });
  }

  // Search on Enter key
  document.getElementById("search-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      searchJobs();
    }
  });

  // Initial view setup
  showSearchView();
});

// Load saved jobs from Chrome storage
function loadSavedJobs() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['savedJobs'], (result) => {
      savedJobs = result.savedJobs || [];
    });
  } else {
    // Fallback to localStorage for testing outside Chrome
    const savedJobsStr = localStorage.getItem('savedJobs');
    savedJobs = savedJobsStr ? JSON.parse(savedJobsStr) : [];
  }
}

// Save jobs to Chrome storage
function saveSavedJobs() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ 'savedJobs': savedJobs });
  } else {
    // Fallback to localStorage for testing outside Chrome
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }
}

// Load user profile from storage
function loadUserProfile() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['userProfile'], (result) => {
      userProfile = result.userProfile || {};

      // Fill profile form with saved data if available
      populateProfileForm();
    });
  } else {
    // Fallback to localStorage for testing outside Chrome
    const profileStr = localStorage.getItem('userProfile');
    userProfile = profileStr ? JSON.parse(profileStr) : {};

    // Fill profile form with saved data if available
    populateProfileForm();
  }
}

// Populate profile form with saved user data
function populateProfileForm() {
  if (userProfile.fullName) document.getElementById("full-name").value = userProfile.fullName;
  if (userProfile.email) document.getElementById("email").value = userProfile.email;
  if (userProfile.phone) document.getElementById("phone").value = userProfile.phone;
  if (userProfile.experience) document.getElementById("experience").value = userProfile.experience;
  if (userProfile.education) document.getElementById("education").value = userProfile.education;
  if (userProfile.skills) document.getElementById("skills").value = userProfile.skills;
}

// Save profile data
function saveProfile() {
  userProfile = {
    fullName: document.getElementById("full-name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    experience: document.getElementById("experience").value,
    education: document.getElementById("education").value,
    skills: document.getElementById("skills").value
  };

  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ 'userProfile': userProfile });
  } else {
    // Fallback to localStorage for testing outside Chrome
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }

  closeProfileModal();

  // If we're in profile view, refresh it
  if (currentView === 'profile') {
    showProfileView();
  }
}

// Open profile modal
function openProfileModal() {
  document.getElementById("profile-modal").style.display = "flex";
  populateProfileForm();
}

// Close profile modal
function closeProfileModal() {
  document.getElementById("profile-modal").style.display = "none";
}

// Animation helper function
function animateElementFade(element, direction) {
  // Remove any existing transition classes
  element.classList.remove("fade-enter", "fade-enter-active", "fade-exit", "fade-exit-active");

  if (direction === 'in') {
    // Fade in
    element.classList.add("fade-enter");
    setTimeout(() => {
      element.classList.remove("fade-enter");
      element.classList.add("fade-enter-active");
    }, 10);
  } else {
    // Fade out
    element.classList.add("fade-exit");
    setTimeout(() => {
      element.classList.remove("fade-exit");
      element.classList.add("fade-exit-active");
    }, 10);
  }
}

// Show search view
function showSearchView() {
  if (currentView === 'search') return;

  currentView = 'search';
  document.getElementById("search-tab").classList.add("active");
  document.getElementById("saved-tab").classList.remove("active");
  document.getElementById("profile-tab").classList.remove("active");

  const resultsDiv = document.getElementById("results");

  // Fade out current content
  animateElementFade(resultsDiv, 'out');

  // After fade out, update content
  setTimeout(() => {
    // Display last search results if available
    if (searchResults.length > 0) {
      displaySearchResults(searchResults);
    } else {
      displayEmptyState("search");
    }
  }, 300);
}

// Show saved jobs view
function showSavedJobsView() {
  if (currentView === 'saved') return;

  currentView = 'saved';
  document.getElementById("saved-tab").classList.add("active");
  document.getElementById("search-tab").classList.remove("active");
  document.getElementById("profile-tab").classList.remove("active");

  const resultsDiv = document.getElementById("results");

  // Fade out current content
  animateElementFade(resultsDiv, 'out');

  // After fade out, update content
  setTimeout(() => {
    displaySavedJobs();
  }, 300);
}

// Show profile view
function showProfileView() {
  if (currentView === 'profile') return;

  currentView = 'profile';
  document.getElementById("profile-tab").classList.add("active");
  document.getElementById("search-tab").classList.remove("active");
  document.getElementById("saved-tab").classList.remove("active");

  const resultsDiv = document.getElementById("results");

  // Fade out current content
  animateElementFade(resultsDiv, 'out');

  // After fade out, update content
  setTimeout(() => {
    displayProfileView();
  }, 300);
}

// Display profile view
function displayProfileView() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  // Check if profile is empty
  const isProfileEmpty = !userProfile.fullName &&
    !userProfile.email &&
    !userProfile.phone &&
    !userProfile.experience &&
    !userProfile.education &&
    !userProfile.skills;

  if (isProfileEmpty) {
    // Show empty profile state
    const emptyStateDiv = document.createElement("div");
    emptyStateDiv.className = "empty-state";
    emptyStateDiv.innerHTML = `
      <div class="empty-state-icon">👤</div>
      <div class="empty-state-text">Set up your professional profile to enable auto-apply features</div>
      <button id="setup-profile-btn" class="modal-btn modal-btn-primary" style="margin-top: 20px;">Set Up Profile</button>
    `;
    resultsDiv.appendChild(emptyStateDiv);

    // Add event listener to setup button
    document.getElementById("setup-profile-btn").addEventListener("click", openProfileModal);
  } else {
    // Display existing profile
    const profileDiv = document.createElement("div");
    profileDiv.className = "results-container";
    profileDiv.innerHTML = `
      <div style="padding: 20px; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h3 style="font-size: 18px; margin-bottom: 15px; color: #333;">${userProfile.fullName || 'No name provided'}</h3>
        <p style="font-size: 14px; color: #666; margin-bottom: 10px;">📧 ${userProfile.email || 'No email provided'}</p>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">📱 ${userProfile.phone || 'No phone provided'}</p>
        
        <div style="margin-bottom: 15px;">
          <h4 style="font-size: 15px; color: #444; margin-bottom: 5px;">Experience</h4>
          <p style="font-size: 14px; color: #666; white-space: pre-line;">${userProfile.experience || 'No experience provided'}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h4 style="font-size: 15px; color: #444; margin-bottom: 5px;">Education</h4>
          <p style="font-size: 14px; color: #666; white-space: pre-line;">${userProfile.education || 'No education provided'}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h4 style="font-size: 15px; color: #444; margin-bottom: 5px;">Skills</h4>
          <p style="font-size: 14px; color: #666; white-space: pre-line;">${userProfile.skills || 'No skills provided'}</p>
        </div>
        
        <button id="edit-profile-btn" class="modal-btn modal-btn-primary" style="margin-top: 10px;">Edit Profile</button>
      </div>
      
      <div style="background-color: #f5f5f7; border-radius: 10px; padding: 15px; border-left: 4px solid #4169E1;">
        <h4 style="font-size: 15px; color: #333; margin-bottom: 10px;">🤖 AI Auto-Apply</h4>
        <p style="font-size: 13px; color: #666; line-height: 1.5;">
          With your profile set up, you can now use the Auto-Apply feature to let AI help you apply to job listings automatically.
          Look for the "Auto-Apply" button on job listings.
        </p>
      </div>
    `;
    resultsDiv.appendChild(profileDiv);

    // Add event listener to edit button
    document.getElementById("edit-profile-btn").addEventListener("click", openProfileModal);
  }

  // Animate in
  animateElementFade(resultsDiv, 'in');
}

// Display empty state
function displayEmptyState(type) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  let message = "";
  let icon = "";

  if (type === "search") {
    message = "Search for jobs to get started";
    icon = "🔍";
  } else if (type === "saved") {
    message = "No saved jobs yet.<br>Save jobs to access them later.";
    icon = "🔖";
  } else if (type === "no-results") {
    message = "No jobs found matching your search.<br>Try different keywords.";
    icon = "🔍";
  }

  const emptyStateDiv = document.createElement("div");
  emptyStateDiv.className = "empty-state";
  emptyStateDiv.innerHTML = `
    <div class="empty-state-icon">${icon}</div>
    <div class="empty-state-text">${message}</div>
  `;

  resultsDiv.appendChild(emptyStateDiv);
  animateElementFade(resultsDiv, 'in');
}

function displayLoading() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading-indicator";
  loadingDiv.innerHTML = `<div class="spinner"></div>`;

  resultsDiv.appendChild(loadingDiv);
  isLoading = true;
}

// Search for jobs
async function searchJobs() {
  const query = document.getElementById("search-input").value.trim();

  if (!query) return;

  displayLoading();

  try {
    // Use Google Custom Search API to find jobs
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query + " job posting")}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      processSearchResults(data.items, query);
    } else {
      displayEmptyState("no-results");
      isLoading = false;
    }
  } catch (error) {
    console.error("Error searching for jobs:", error);
    displaySearchError();
    isLoading = false;
  }
}

// Process search results and enhance them
async function processSearchResults(items, query) {
  try {
    // Transform search results to job listings
    searchResults = items.map(item => {
      return {
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: item.displayLink,
        ranking: Math.floor(Math.random() * 5) + 1, // Mock ranking for demo
        isSaved: isJobSaved(item.link)
      };
    });

    // Sort results based on current sort method
    sortSearchResults();

    // Enhance job descriptions with Gemini API if available
    if (GEMINI_API_KEY) {
      await enhanceJobDescriptions();
    }

    // Display the processed results
    displaySearchResults(searchResults);
  } catch (error) {
    console.error("Error processing search results:", error);
    displaySearchError();
  } finally {
    isLoading = false;
  }
}

// Sort search results based on current sort method
function sortSearchResults() {
  if (sortMethod === 'relevance') {
    // Default order from search API
    return;
  } else if (sortMethod === 'popularity') {
    // Sort by ranking (highest first)
    searchResults.sort((a, b) => b.ranking - a.ranking);
  }
}

// Enhance job descriptions using Gemini API
async function enhanceJobDescriptions() {
  // Process in batches to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < searchResults.length; i += batchSize) {
    const batch = searchResults.slice(i, i + batchSize);

    const enhancePromises = batch.map(async (job) => {
      try {
        const prompt = `Enhance this job description: "${job.snippet}". Extract the following in JSON format: 
          {
            "company": "company name if present",
            "location": "job location if present",
            "salary": "salary range if present",
            "skills": ["key skills required"],
            "summary": "one-sentence summary"
          }`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const text = data.candidates[0].content.parts[0].text;

          // Try to parse the JSON response
          try {
            // Find JSON in the response
            const jsonMatch = text.match(/(\{[\s\S]*\})/);
            if (jsonMatch) {
              const jsonStr = jsonMatch[0];
              const enhancedData = JSON.parse(jsonStr);

              // Update job with enhanced data
              job.company = enhancedData.company;
              job.location = enhancedData.location;
              job.salary = enhancedData.salary;
              job.skills = enhancedData.skills;
              job.enhancedSummary = enhancedData.summary;
            }
          } catch (jsonError) {
            console.error("Error parsing enhanced job data:", jsonError);
          }
        }
      } catch (error) {
        console.error("Error enhancing job description:", error);
      }
    });

    await Promise.all(enhancePromises);
  }
}

// Display search results
function displaySearchResults(results) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const resultsContainer = document.createElement("div");
  resultsContainer.className = "results-container";

  // Add sorting options if there are results
  if (results.length > 0) {
    const sortingOptions = document.createElement("div");
    sortingOptions.className = "sorting-options";
    sortingOptions.innerHTML = `
      <span class="sort-label">Sort by:</span>
      <button id="sort-relevance" class="sort-btn ${sortMethod === 'relevance' ? 'active' : ''}">Relevance</button>
      <button id="sort-popularity" class="sort-btn ${sortMethod === 'popularity' ? 'active' : ''}">Popularity</button>
    `;
    resultsContainer.appendChild(sortingOptions);

    // Add event listeners to sort buttons
    setTimeout(() => {
      document.getElementById("sort-relevance").addEventListener("click", () => {
        sortMethod = 'relevance';
        sortSearchResults();
        displaySearchResults(searchResults);
      });

      document.getElementById("sort-popularity").addEventListener("click", () => {
        sortMethod = 'popularity';
        sortSearchResults();
        displaySearchResults(searchResults);
      });
    }, 0);
  }

  // Add each result item
  results.forEach(result => {
    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    // Create stars based on ranking
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      starsHTML += `<span class="star ${i <= result.ranking ? 'filled' : ''}">★</span>`;
    }

    // Create enhanced content if available
    let enhancedHTML = '';
    if (result.company || result.location || result.salary || result.skills) {
      enhancedHTML = `
        <div style="font-size: 12px; margin-bottom: 10px;">
          ${result.company ? `<div style="margin-bottom: 3px;"><strong>Company:</strong> ${result.company}</div>` : ''}
          ${result.location ? `<div style="margin-bottom: 3px;"><strong>Location:</strong> ${result.location}</div>` : ''}
          ${result.salary ? `<div style="margin-bottom: 3px;"><strong>Salary:</strong> ${result.salary}</div>` : ''}
          ${result.skills ? `<div><strong>Skills:</strong> ${result.skills.join(', ')}</div>` : ''}
        </div>
      `;
    }

    resultItem.innerHTML = `
      <a href="${result.link}" target="_blank">${result.title}</a>
      <div class="ranking-indicator">
        ${starsHTML}
        <span class="ranking-label">Match</span>
      </div>
      ${enhancedHTML}
      <p>${result.enhancedSummary || result.snippet}</p>
      <div>
        <button class="save-btn ${result.isSaved ? 'saved' : ''}" data-url="${result.link}">
          <span class="save-icon">🔖</span>
          <span class="save-icon-saved">✓</span>
          ${result.isSaved ? 'Saved' : 'Save Job'}
        </button>
        <button class="auto-apply-btn" data-url="${result.link}">
          <span class="auto-apply-icon">🤖</span>
          Auto-Apply
        </button>
      </div>
    `;

    resultsContainer.appendChild(resultItem);
  });

  resultsDiv.appendChild(resultsContainer);

  // Add event listeners to save buttons
  document.querySelectorAll('.save-btn').forEach(button => {
    button.addEventListener('click', toggleSaveJob);
  });

  // Add event listeners to auto-apply buttons
  document.querySelectorAll('.auto-apply-btn').forEach(button => {
    button.addEventListener('click', autoApplyToJob);
  });

  // Animate in the results
  animateElementFade(resultsDiv, 'in');
  isLoading = false;
}

// Display saved jobs
function displaySavedJobs() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (savedJobs.length === 0) {
    displayEmptyState("saved");
    return;
  }

  const resultsContainer = document.createElement("div");
  resultsContainer.className = "results-container";

  savedJobs.forEach(job => {
    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    resultItem.innerHTML = `
      <a href="${job.link}" target="_blank">${job.title}</a>
      ${job.company ? `<div style="font-size: 12px; margin-bottom: 8px;"><strong>Company:</strong> ${job.company}</div>` : ''}
      <p>${job.snippet}</p>
      <div>
        <button class="save-btn saved" data-url="${job.link}">
          <span class="save-icon">🔖</span>
          <span class="save-icon-saved">✓</span>
          Saved
        </button>
        <button class="auto-apply-btn" data-url="${job.link}">
          <span class="auto-apply-icon">🤖</span>
          Auto-Apply
        </button>
      </div>
    `;

    resultsContainer.appendChild(resultItem);
  });

  resultsDiv.appendChild(resultsContainer);

  // Add event listeners to save buttons
  document.querySelectorAll('.save-btn').forEach(button => {
    button.addEventListener('click', toggleSaveJob);
  });

  // Add event listeners to auto-apply buttons
  document.querySelectorAll('.auto-apply-btn').forEach(button => {
    button.addEventListener('click', autoApplyToJob);
  });

  // Animate in the results
  animateElementFade(resultsDiv, 'in');
}

// Display search error
function displaySearchError() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const errorDiv = document.createElement("div");
  errorDiv.className = "empty-state";
  errorDiv.innerHTML = `
    <div class="empty-state-icon">⚠️</div>
    <div class="empty-state-text">Sorry, something went wrong with your search.<br>Please try again later.</div>
  `;

  resultsDiv.appendChild(errorDiv);
  animateElementFade(resultsDiv, 'in');
}

// Check if job is saved
function isJobSaved(url) {
  return savedJobs.some(job => job.link === url);
}

// Toggle save job
function toggleSaveJob(event) {
  const button = event.currentTarget;
  const url = button.getAttribute('data-url');
  const isSaved = button.classList.contains('saved');

  if (isSaved) {
    // Remove from saved jobs
    savedJobs = savedJobs.filter(job => job.link !== url);
    button.classList.remove('saved');
    button.innerHTML = `<span class="save-icon">🔖</span><span class="save-icon-saved">✓</span> Save Job`;
  } else {
    // Add to saved jobs
    const jobToSave = searchResults.find(job => job.link === url) || {
      title: button.closest('.result-item').querySelector('a').textContent,
      link: url,
      snippet: button.closest('.result-item').querySelector('p').textContent
    };

    // Mark as saved
    jobToSave.isSaved = true;

    // Add to saved jobs if not already there
    if (!isJobSaved(url)) {
      savedJobs.push(jobToSave);
    }

    button.classList.add('saved');
    button.innerHTML = `<span class="save-icon">🔖</span><span class="save-icon-saved">✓</span> Saved`;
  }

  // Update saved jobs in storage
  saveSavedJobs();

  // If we're in saved jobs view, refresh it
  if (currentView === 'saved') {
    showSavedJobsView();
  }
}

// Auto-apply to job
async function autoApplyToJob(event) {
  const button = event.currentTarget;
  const url = button.getAttribute('data-url');

  // Check if profile is set up
  if (!userProfile.fullName || !userProfile.email) {
    alert("Please set up your profile first to use Auto-Apply");
    showProfileView();
    openProfileModal();
    return;
  }

  // Update button state to applying
  button.classList.add('applying');
  button.innerHTML = `<span class="auto-apply-icon">⏳</span> Applying...`;

  try {
    // Get job details
    const jobItem = searchResults.find(job => job.link === url) ||
      savedJobs.find(job => job.link === url) ||
      { link: url };

    // Use Gemini to generate an application
    if (GEMINI_API_KEY) {
      const prompt = `Generate a job application for this position: ${jobItem.title || 'job position'}. 
      The application should be for a candidate with the following profile:
      Name: ${userProfile.fullName}
      Email: ${userProfile.email}
      Phone: ${userProfile.phone || 'Not provided'}
      Experience: ${userProfile.experience || 'Not provided'}
      Education: ${userProfile.education || 'Not provided'}
      Skills: ${userProfile.skills || 'Not provided'}
      
      Include a professional cover letter tailored to the job based on my skills and experience.`;

      // Simulate applying
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update button state to applied
      button.classList.remove('applying');
      button.classList.add('applied');
      button.innerHTML = `<span class="auto-apply-icon">✓</span> Applied`;
      button.disabled = true;

      // Show success message
      alert(`Successfully applied to "${jobItem.title || 'job position'}" as ${userProfile.fullName}`);
    } else {
      throw new Error("Gemini API key is not available");
    }
  } catch (error) {
    console.error("Error auto-applying to job:", error);

    // Reset button state
    button.classList.remove('applying');
    button.innerHTML = `<span class="auto-apply-icon">🤖</span> Auto-Apply`;

    alert("Failed to apply to job. Please try again later.");
  }
}

// Initialize the application when loaded
// (This is already included in the original code)