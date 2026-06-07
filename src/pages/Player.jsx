import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Player = () => {
  const { clientSlug: pathClientSlug, screenSlug: pathScreenSlug } = useParams();
  const [searchParams] = useSearchParams();
  const clientSlug = pathClientSlug || searchParams.get('clientSlug');
  const screenSlug = pathScreenSlug || searchParams.get('screenSlug');
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [noContent, setNoContent] = useState(false);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/player?clientSlug=${clientSlug}&screenSlug=${screenSlug}`);
      
      if (response.data.success) {
        setContentData(response.data.data.content);
        setNoContent(false);
        setError(false);
      } else {
        setNoContent(true);
        setContentData(null);
        setError(false);
      }
    } catch (err) {
      console.error("Failed to fetch player content:", err);
      // Determine if error is a 404/no content vs an actual server/network error
      if (err.response && err.response.status === 404) {
          setNoContent(true);
          setContentData(null);
          setError(false);
      } else {
          setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchContent();

    // Auto refresh every 30 seconds
    const intervalId = setInterval(fetchContent, 30000);

    return () => clearInterval(intervalId);
  }, [clientSlug, screenSlug]);

  // Styling constants
  const fullScreenStyle = {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    fontFamily: '"Inter", "Roboto", sans-serif'
  };

  const mediaStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // Using contain to show full content, or cover depending on req. 'Fit entire screen' often means cover or contain. "Fit entire screen" without stretching usually means contain with black background, or cover. I will use contain to avoid cropping.
    border: 'none',
    margin: 0,
    padding: 0
  };

  if (loading && !contentData && !noContent && !error) {
    return (
      <div style={fullScreenStyle}>
        <h2>Loading player...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={fullScreenStyle}>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ff4c4c' }}>Unable to load content.</h2>
        <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>Retrying...</p>
      </div>
    );
  }

  if (noContent || !contentData) {
    return (
      <div style={fullScreenStyle}>
        <h1 style={{ fontSize: '4vw', fontWeight: 'bold', marginBottom: '2vh', textAlign: 'center' }}>
          This Screen Is Available For Advertising
        </h1>
        <p style={{ fontSize: '2vw', opacity: 0.8, marginBottom: '4vh', textAlign: 'center' }}>
          Promote your business, offers, events and brand.
        </p>
        <div style={{ padding: '2vh 4vw', backgroundColor: '#333', borderRadius: '1rem', fontSize: '2vw', fontWeight: 'bold' }}>
          Contact: +91 XXXXX XXXXX
        </div>
      </div>
    );
  }

  const { mediaType, filePath } = contentData;

  if (mediaType === 'video') {
    return (
      <div style={fullScreenStyle}>
        <video 
          src={filePath}
          autoPlay 
          muted 
          loop 
          playsInline
          style={mediaStyle}
        />
      </div>
    );
  }

  if (mediaType === 'image') {
    return (
      <div style={fullScreenStyle}>
        <img 
          src={filePath} 
          alt="DOOH Content" 
          style={mediaStyle} 
        />
      </div>
    );
  }

  // Fallback
  return <div style={fullScreenStyle}></div>;
};

export default Player;
