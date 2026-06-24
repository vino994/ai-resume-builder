const IS_DEV = window.location.hostname === 'localhost';
const PRODUCTION_BACKEND_URL = "https://resume-elet.onrender.com";
const BACKEND_URL = IS_DEV ? "http://localhost:5000" : PRODUCTION_BACKEND_URL;
export const autoGenerateResume = async (basicInfo) => {
  const response = await fetch(`${BACKEND_URL}/generate-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ basicInfo })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Backend request failed');
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const tailorResume = async (resumeData, jobDescription) => {
  const response = await fetch(`${BACKEND_URL}/tailor-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeData, jobDescription })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Tailor request failed');
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};