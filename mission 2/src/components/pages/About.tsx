export default function About() {
  return (
    <section className="page-card">
      <h2 className="section-title">About the app</h2>
      <div className="content-box">
        <p>
          This is a simple weather display app for locations in Israel. Select a city
          from the list to view the current weather.
        </p>
        <p>
          The app is built with React, TypeScript, and Vite. Data is fetched from a
          government city data API and WeatherAPI.
        </p>
      </div>
      <h3 className="section-subtitle">Developer details</h3>
      <div className="content-box">
        <p>Name: Matan Arazi</p>
        <p>Course: HTML, CSS, TypeScript, React, API, AI</p>
      </div>
    </section>
  )
}
