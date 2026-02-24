import { useState } from "react";


function BecomeTutor() {
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
    qualification: "",
    fieldOfStudy: "",
    experienceYears: "",
    skills: "",
    teachingLevel: "",
    bio: "",
    cv: null,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Temporary simulation
    setTimeout(() => {
      console.log(formData);
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (alreadyApplied) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">
                    You have already submitted an application.
                </h2>
                <p className="text-gray-600 mt-2">
                    Our team is reviewing your request.
                </p>
            </div>
        );
    }
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Apply to Become a Tutor
      </h1>
     <p className="text-gray-600 mb-6 text-center">
        Join our platform as a verified tutor and share your expertise with learners.
     </p>

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
          ✅ Your application has been submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Info */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Personal Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className="p-3 border rounded"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location (City, Country)"
              className="p-3 border rounded"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Professional Info */}
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Professional Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="qualification"
              placeholder="Highest Qualification"
              className="p-3 border rounded"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="fieldOfStudy"
              placeholder="Field of Study"
              className="p-3 border rounded"
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="number"
            name="experienceYears"
            placeholder="Years of Experience"
            className="p-3 border rounded mt-4 w-full"
            onChange={handleChange}
            required
          />
        </div>

        {/* Teaching Info */}
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Teaching Information
          </h2>

          <textarea
            name="skills"
            placeholder="Skills You Want to Teach"
            className="p-3 border rounded w-full"
            onChange={handleChange}
            required
          />

          <select
            name="teachingLevel"
            className="p-3 border rounded w-full mt-4"
            onChange={handleChange}
            required
          >
            <option value="">Select Teaching Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <textarea
            name="bio"
            placeholder="Short Bio"
            className="p-3 border rounded w-full mt-4"
            onChange={handleChange}
            required
          />
        </div>

        {/* Upload CV */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Supporting Documents</h2>

          <input
            type="file"
            name="cv"
            className="w-full"
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default BecomeTutor;