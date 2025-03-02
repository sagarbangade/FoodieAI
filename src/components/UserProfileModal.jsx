// src/components/UserProfileModal.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { User, X, Save, Loader2, AlertTriangle } from "lucide-react";
import { updateProfile } from "firebase/auth";

const UserProfileModal = ({ isOpen, onClose }) => {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    photoURL: "",
    bio: "",
    location: "",
    preferences: {
      dietaryRestrictions: "",
      cuisinePreferences: [],
      priceRange: "",
      accessibility: "",
    }
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setProfileData({ ...profileData, ...docSnap.data() });
          } else {
            setProfileData((prevData) => ({
              ...prevData,
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              email: user.email,
              userId: user.uid,
            }));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setError("Failed to load profile data.");
        } finally {
          setLoading(false);
        }
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

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      preferences: { ...prevData.preferences, [name]: value },
    }));
  };

  const handleCuisineChange = (cuisine) => {
    setProfileData((prevData) => {
      const currentCuisines = prevData.preferences.cuisinePreferences || [];
      const updatedCuisines = currentCuisines.includes(cuisine)
        ? currentCuisines.filter((item) => item !== cuisine)
        : [...currentCuisines, cuisine];

      return {
        ...prevData,
        preferences: { ...prevData.preferences, cuisinePreferences: updatedCuisines },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, profileData);

      if (auth.currentUser.displayName !== profileData.displayName || auth.currentUser.photoURL !== profileData.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName,
          photoURL: profileData.photoURL,
        });
      }

      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-2xl overflow-auto max-h-[90vh] text-gray-200 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-400">Your Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
          </div>
        )}

        {error && (
          <div
            className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <AlertTriangle className="inline mr-2 h-5 w-5" />
            <span className="inline align-middle">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded relative mb-4"
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
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                Basic Information
              </h3>
              <div className="flex justify-center mb-6">
                {profileData.photoURL ? (
                  <img
                    src={profileData.photoURL}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    name="photoURL"
                    value={profileData.photoURL}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Food Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                Food Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Dietary Restrictions
                  </label>
                  <select
                    name="dietaryRestrictions"
                    value={profileData.preferences.dietaryRestrictions}
                    onChange={handlePreferencesChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="None">None</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                    <option value="Dairy-Free">Dairy-Free</option>
                    <option value="Nut-Free">Nut-Free</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Price Range
                  </label>
                  <select
                    name="priceRange"
                    value={profileData.preferences.priceRange}
                    onChange={handlePreferencesChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="$">$ (Budget-friendly)</option>
                    <option value="$$">$$ (Mid-range)</option>
                    <option value="$$$">$$$ (Upscale)</option>
                    <option value="$$$$">$$$$ (Fine dining)</option>
                  </select>
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-300">
                    Cuisine Preferences
                  </label>
                  <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Italian",
                      "Chinese",
                      "Japanese",
                      "Mexican",
                      "Indian",
                      "Thai",
                      "Mediterranean",
                      "French",
                      "American",
                      "Korean",
                      "Middle Eastern",
                      "Vegetarian"
                    ].map((cuisine) => (
                      <label
                        key={cuisine}
                        className="inline-flex items-center"
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-500"
                          checked={(profileData.preferences.cuisinePreferences || []).includes(cuisine)}
                          onChange={() => handleCuisineChange(cuisine)}
                        />
                        <span className="ml-2 text-gray-300">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Accessibility Needs
                  </label>
                  <input
                    type="text"
                    name="accessibility"
                    value={profileData.preferences.accessibility}
                    onChange={handlePreferencesChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Wheelchair access, quiet environment"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
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