// src/components/UserProfileModal.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { User, X, Edit, Save, Loader2, AlertTriangle } from "lucide-react"; // Import necessary icons
import { updateProfile } from "firebase/auth";

const UserProfileModal = ({ isOpen, onClose }) => {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // Use boolean for success state
  const [profileData, setProfileData] = useState({
    displayName: "",
    photoURL: "",
    bio: "",
    socialMedia: { facebook: "", twitter: "", instagram: "", linkedin: "" },
    emergencyContacts: [{ name: "", relationship: "", phone: "" }],
    preferences: {
      travelStyle: "",
      accommodationType: "",
      interests: [],
      dietaryRestrictions: "",
      accessibilityNeeds: "",
    },
    passportDetails: { passportNumber: "", expiryDate: "", nationality: "" },
    preferredLanguage: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log("fetchUserProfile called"); // Log when the function starts

      if (user) {
        console.log("User is authenticated:", user.uid); // Log user UID
        setLoading(true);
        setError(null);
        try {
          const docRef = doc(db, "users", user.uid);
          console.log("Fetching document:", docRef.path); // Log the document path
          const docSnap = await getDoc(docRef);
          console.log("Document snapshot:", docSnap); //Log the Snapshot

          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data()); // Log retrieved data
            setProfileData({ ...profileData, ...docSnap.data() });
          } else {
            console.log("No such document!"); // Log if document doesn't exist
            // ... (rest of your initialization logic)
            setProfileData((prevData) => ({
              ...prevData,
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              email: user.email,
              userId: user.uid,
            }));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err); // Log the full error object
          console.error("Error code:", err.code); // Log Firestore error code
          console.error("Error message:", err.message); // Log Firestore error message
          setError("Failed to load profile data.");
        } finally {
          setLoading(false);
        }
      } else {
        console.warn("User is not authenticated."); // Log if user is not authenticated
      }
    };

    if (isOpen && user) {
      fetchUserProfile();
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      socialMedia: { ...prevData.socialMedia, [name]: value },
    }));
  };

  const handleEmergencyContactChange = (index, field, value) => {
    setProfileData((prevData) => {
      const updatedContacts = [...prevData.emergencyContacts];
      updatedContacts[index] = { ...updatedContacts[index], [field]: value };
      return { ...prevData, emergencyContacts: updatedContacts };
    });
  };

  const addEmergencyContact = () => {
    setProfileData((prevData) => ({
      ...prevData,
      emergencyContacts: [
        ...prevData.emergencyContacts,
        { name: "", relationship: "", phone: "" },
      ],
    }));
  };
  const removeEmergencyContact = (index) => {
    setProfileData((prevData) => {
      const updatedContacts = [...prevData.emergencyContacts];
      updatedContacts.splice(index, 1);
      return { ...prevData, emergencyContacts: updatedContacts };
    });
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      preferences: { ...prevData.preferences, [name]: value },
    }));
  };

  const handleInterestChange = (interest) => {
    setProfileData((prevData) => {
      const currentInterests = prevData.preferences.interests;
      const updatedInterests = currentInterests.includes(interest)
        ? currentInterests.filter((item) => item !== interest)
        : [...currentInterests, interest];

      return {
        ...prevData,
        preferences: { ...prevData.preferences, interests: updatedInterests },
      };
    });
  };

  const handlePassportChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      passportDetails: { ...prevData.passportDetails, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    console.log("Submitting profile data:", profileData); // Log the data *before* update

    try {
      const docRef = doc(db, "users", user.uid);

      // Log the document path (for good measure)
      console.log("Updating document in Firestore:", docRef.path, profileData);

      // Only update fields that are part of the profileData in Firestore
      await updateDoc(docRef, profileData);
      console.log("Firestore updateDoc completed."); // Log after Firestore update

      // **ADD THIS SECTION TO UPDATE FIREBASE AUTH PROFILE:**
      if (auth.currentUser.displayName !== profileData.displayName || auth.currentUser.photoURL !== profileData.photoURL) {
        console.log("Updating Firebase Authentication Profile");
        console.log("Profile Data for Authentication Update:", {
          displayName: profileData.displayName,
          photoURL: profileData.photoURL,
        });
        await updateProfile(auth.currentUser, { // Use updateProfile here!
          displayName: profileData.displayName,
          photoURL: profileData.photoURL,
        });
        console.log("Firebase Authentication profile updated.");
      } else {
        console.log("No changes in displayName or photoURL for Auth profile update.");
      }

      console.log("Profile update process successful!"); // General success log

      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Error updating profile:", err); // Log the full error
      console.error("Error code:", err.code); // Log Firestore error code (if applicable)
      console.error("Error message:", err.message); // Log Firestore error message (if applicable)
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-orange-500" />
          </div>
        )}

        {error && (
          <div
            className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <AlertTriangle className="inline mr-2 h-5 w-5" />
            <span className="inline align-middle">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <Save className="inline mr-2 h-5 w-5" />
            <span className="inline align-middle">
              Profile updated successfully!
            </span>
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Basic Information
              </h3>
              <div className="flex justify-center mb-6">
                {profileData.photoURL ? (
                  <img
                    src={profileData.photoURL}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    name="photoURL"
                    value={profileData.photoURL}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Social Media
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Facebook
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    value={profileData.socialMedia.facebook}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Twitter
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={profileData.socialMedia.twitter}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={profileData.socialMedia.instagram}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    name="linkedin"
                    value={profileData.socialMedia.linkedin}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Emergency Contacts
              </h3>
              {profileData.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) =>
                        handleEmergencyContactChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={contact.relationship}
                      onChange={(e) =>
                        handleEmergencyContactChange(
                          index,
                          "relationship",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={contact.phone}
                      onChange={(e) =>
                        handleEmergencyContactChange(
                          index,
                          "phone",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-full md:col-span-1 flex items-end justify-start">
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEmergencyContact}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Contact
              </button>
            </div>

            {/* Travel Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Travel Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Travel Style
                  </label>
                  <select
                    name="travelStyle"
                    value={profileData.preferences.travelStyle}
                    onChange={handlePreferencesChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="">Select...</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Budget">Budget</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Accommodation Type
                  </label>
                  <select
                    name="accommodationType"
                    value={profileData.preferences.accommodationType}
                    onChange={handlePreferencesChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="">Select...</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Camping">Camping</option>
                    <option value="Resort">Resort</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Interests
                  </label>
                  <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Hiking",
                      "Food",
                      "History",
                      "Art",
                      "Music",
                      "Nature",
                      "Shopping",
                      "Sports",
                    ].map((interest) => (
                      <label
                        key={interest}
                        className="inline-flex items-center"
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-orange-600"
                          checked={profileData.preferences.interests.includes(
                            interest
                          )}
                          onChange={() => handleInterestChange(interest)}
                        />
                        <span className="ml-2 text-gray-700">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dietary Restrictions
                  </label>
                  <select
                    name="dietaryRestrictions"
                    value={profileData.preferences.dietaryRestrictions}
                    onChange={handlePreferencesChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="">Select...</option>
                    <option value="None">None</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                    <option value="Dairy-Free">Dairy-Free</option>
                    <option value="Nut-Free">Nut-Free</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Accessibility Needs
                  </label>
                  <input
                    type="text"
                    name="accessibilityNeeds"
                    value={profileData.preferences.accessibilityNeeds}
                    onChange={handlePreferencesChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    placeholder="e.g., Wheelchair access"
                  />
                </div>
              </div>
            </div>
            {/* Passport Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Passport Details (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={profileData.passportDetails.passportNumber}
                    onChange={handlePassportChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="date" // Use type="date" for date input
                    name="expiryDate"
                    value={profileData.passportDetails.expiryDate}
                    onChange={handlePassportChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={profileData.passportDetails.nationality}
                    onChange={handlePassportChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Language
              </label>
              <select
                name="preferredLanguage"
                value={profileData.preferredLanguage}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">Select...</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                {/* Add more languages as needed */}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 mt-4"
            >
              Update Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
