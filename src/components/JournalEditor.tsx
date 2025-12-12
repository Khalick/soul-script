import React, { useState, useRef, useEffect } from 'react';
import { Mic, Video, Image, X, Square, Camera, Upload, FileText } from 'lucide-react';
import { useJournalStore } from '../stores/journalStore';
import { getRandomPrompt } from '../data/emotions';
import { journalTemplates } from '../data/templates';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTemplateStore } from '../stores/templateStore';
import { useOfflineStore } from '../stores/offlineStore';
import { getGradientBackground, adjustBrightness } from '../lib/colorUtils';
import { AmbiencePlayer } from './AmbiencePlayer';
import { Affirmation } from './Affirmation';
import { SaveNotification } from './SaveNotification';
import { SharePostModal } from './SharePostModal';

interface JournalEditorProps {
  onSave: () => void;
  onCancel: () => void;
  editingEntry?: any;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ onSave, onCancel, editingEntry }) => {
  const { currentEntry, addEntry, updateEntry } = useJournalStore();
  const { user } = useAuthStore();
  const { favoriteColor, favoriteEmoji } = useSettingsStore();
  const { customTemplates, addCustomTemplate } = useTemplateStore();
  const { isOnline, addOfflineEntry } = useOfflineStore();
  const [textContent, setTextContent] = useState(editingEntry?.text_content || '');
  const [title, setTitle] = useState(editingEntry?.title || '');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [prompt] = useState(getRandomPrompt());
  const [isRecording, setIsRecording] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<{ type: 'offline' | 'error'; message: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedEntryForSharing, setSavedEntryForSharing] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'dashboard-particle';
      particle.style.left = Math.random() * 100 + '%';
      const size = Math.random() * 5 + 2 + 'px';
      particle.style.width = size;
      particle.style.height = size;
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 20000);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        URL.createObjectURL(audioBlob);
        // Audio URL created but not stored in state
        const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setMediaFiles((prev) => [...prev, file]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      setShowPhotoMenu(false);
      
      // Wait for the next tick to ensure the video element is rendered
      setTimeout(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoPreviewRef.current && canvasRef.current) {
      const video = videoPreviewRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handlePhotoUpload({ target: { files: [file] } } as any);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const startVideoRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: true 
      });
      setStream(mediaStream);
      setShowVideoRecorder(true);
      setShowVideoMenu(false);
      
      // Wait for the next tick to ensure the video element is rendered
      setTimeout(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = mediaStream;
        }
      }, 100);
      
      const recorder = new MediaRecorder(mediaStream);
      videoChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
        handleVideoUpload({ target: { files: [file] } } as any);
      };
      
      videoRecorderRef.current = recorder;
      recorder.start();
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopVideoRecording = () => {
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop();
    }
    // Reset state to allow recording another video
    setTimeout(() => {
      setShowVideoRecorder(false);
      videoRecorderRef.current = null;
    }, 500);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setShowVideoRecorder(false);
    videoRecorderRef.current = null;
  };

  const handleSave = async () => {
    if (!user) return;
    setUploading(true);
    
    try {
      // Check if offline
      if (!isOnline || !navigator.onLine) {
        // Save offline
        if (!editingEntry && currentEntry && currentEntry.mood && currentEntry.intensity) {
          const tempId = `temp-${Date.now()}`;
          const offlineEntry = {
            id: tempId,
            tempId,
            user_id: user.id,
            mood: currentEntry.mood,
            intensity: currentEntry.intensity,
            title: title || undefined,
            text_content: textContent || undefined,
            tags: currentEntry.tags || [],
            is_public: false,
            created_at: new Date().toISOString(),
            isSynced: false,
          };
          
          addOfflineEntry(offlineEntry);
          addEntry(offlineEntry as any);
          setSaveNotification({
            type: 'offline',
            message: 'Your entry has been saved locally and will automatically sync when you reconnect to the internet.'
          });
          setShowAffirmation(true);
        } else {
          setSaveNotification({
            type: 'error',
            message: 'Cannot edit entries while offline. Please connect to the internet to make changes to existing entries.'
          });
          setUploading(false);
          return;
        }
      } else {
        // Online mode - normal save
        // If editing an existing entry
        if (editingEntry) {
          const { error: updateError } = await supabase
            .from('journal_entries')
            .update({
              title: title || undefined,
              text_content: textContent || undefined,
            })
            .eq('id', editingEntry.id);

          if (updateError) throw updateError;

        // Upload new media files
        // Verify authentication before uploading
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated. Please log in again.');
        }

        for (const file of mediaFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${editingEntry.id}/${Date.now()}.${fileExt}`;
          const filePath = fileName; // Remove 'journal-media/' prefix - bucket name is already in .from()

          const { error: uploadError } = await supabase.storage
            .from('journal-media')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw uploadError;
          }

          const { data: urlData } = supabase.storage
            .from('journal-media')
            .getPublicUrl(filePath);

          const { error: insertError } = await supabase.from('media_attachments').insert({
            entry_id: editingEntry.id,
            user_id: user.id,
            type: file.type.startsWith('image/') ? 'photo' : file.type.startsWith('video/') ? 'video' : 'audio',
            url: urlData.publicUrl,
            size_bytes: file.size,
            blur_faces: false,
          });

          if (insertError) {
            console.error('Media insert error:', insertError);
            console.error('Attempted user_id:', user.id);
            console.error('Session user_id:', session.user.id);
            throw insertError;
          }
        }

        updateEntry(editingEntry.id, { title, text_content: textContent });
        setShowAffirmation(true);
      } else {
        // Creating a new entry
        if (!currentEntry) return;
        
        const { data: entry, error: entryError } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            mood: currentEntry.mood,
            intensity: currentEntry.intensity,
            title: title || undefined,
            text_content: textContent || undefined,
            tags: currentEntry.tags || [],
            is_public: false,
          })
          .select()
          .single();

        if (entryError) throw entryError;

        for (const file of mediaFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${entry.id}/${Date.now()}.${fileExt}`;
          const filePath = fileName; // Remove 'journal-media/' prefix - bucket name is already in .from()

          const { error: uploadError } = await supabase.storage
            .from('journal-media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('journal-media')
            .getPublicUrl(filePath);

          await supabase.from('media_attachments').insert({
            entry_id: entry.id,
            user_id: user.id,
            type: file.type.startsWith('image/') ? 'photo' : file.type.startsWith('video/') ? 'video' : 'audio',
            url: urlData.publicUrl,
            size_bytes: file.size,
            blur_faces: false,
          });
        }

        addEntry(entry);
        setSavedEntryForSharing(entry); // Save for potential sharing
        setShowAffirmation(true);
        }
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      setSaveNotification({
        type: 'error',
        message: 'Something went wrong while saving your entry. Please check your connection and try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-page" style={{
      background: getGradientBackground(favoriteColor)
    }}>
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>

      {/* Camera Modal */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              borderRadius: '12px',
              marginBottom: '20px'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={capturePhoto}
              style={{
                padding: '15px 30px',
                background: `linear-gradient(135deg, ${favoriteColor}, ${adjustBrightness(favoriteColor, 20)})`,
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: `0 0 20px ${favoriteColor}50`
              }}
            >
              📸 Capture Photo
            </button>
            <button
              onClick={stopCamera}
              style={{
                padding: '15px 30px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Video Recorder Modal */}
      {showVideoRecorder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              borderRadius: '12px',
              marginBottom: '20px'
            }}
          />
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={stopVideoRecording}
              style={{
                padding: '15px 30px',
                background: '#ef4444',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Square size={18} fill="white" /> Stop Recording
            </button>
            <button
              onClick={stopCamera}
              style={{
                padding: '15px 30px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-content-wrapper">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <div className="text-center" style={{ animation: 'fadeIn 1s ease-out' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', textShadow: '0 0 40px rgba(255, 255, 255, 0.5)', marginBottom: '15px', animation: 'glow 3s ease-in-out infinite' }}>
              {favoriteEmoji} {editingEntry ? 'Edit Your Entry' : 'Write Your Heart Out'}
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '10px' }}>
              {editingEntry ? 'Update your thoughts and feelings' : prompt}
            </p>
          </div>
          <div className="dashboard-card" style={{ animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                ✍️ Your Entry
              </h3>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <FileText size={16} />
                {showTemplates ? 'Hide Templates' : 'Use Template'}
              </button>
            </div>
            
            {showTemplates && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '12px',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '15px' }}>
                  Choose a template to get started:
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                  gap: '10px' 
                }}>
                  {[...journalTemplates, ...customTemplates].map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setTextContent(template.structure);
                        setTitle(template.name);
                        setSelectedTemplate(template.id);
                        setShowTemplates(false);
                      }}
                      style={{
                        padding: '12px',
                        background: selectedTemplate === template.id 
                          ? 'rgba(255, 255, 255, 0.25)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        border: selectedTemplate === template.id 
                          ? '2px solid white' 
                          : '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selectedTemplate === template.id 
                          ? 'rgba(255, 255, 255, 0.25)' 
                          : 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title={template.description}
                    >
                      <span style={{ fontSize: '24px' }}>{template.emoji}</span>
                      <span>{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="Give this entry a title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '15px 20px', background: 'rgba(255, 255, 255, 0.1)', border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', fontSize: '18px', fontWeight: '600', color: 'white', outline: 'none', marginBottom: '20px' }}
            />
            <textarea
              placeholder="What's on your mind?"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={10}
              style={{ width: '100%', padding: '20px', background: 'rgba(255, 255, 255, 0.1)', border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', fontSize: '16px', color: 'white', outline: 'none', resize: 'vertical', lineHeight: '1.6' }}
            />
          </div>
          <div className="dashboard-card" style={{ animationDelay: '0.5s' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '15px' }}>
              📎 Add Media
            </h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
              <input ref={videoCameraInputRef} type="file" accept="video/*" capture="environment" onChange={handleVideoUpload} style={{ display: 'none' }} />
              
              {/* Photo Button with Dropdown */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowPhotoMenu(!showPhotoMenu)} style={{ padding: '15px 25px', background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '15px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Image size={20} /> Photo
                </button>
                {showPhotoMenu && (
                  <div style={{ position: 'absolute', top: '60px', left: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '12px', padding: '10px', zIndex: 1000, minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                    <button onClick={startCamera} style={{ width: '100%', padding: '12px 15px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#333', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <Camera size={18} /> Take Photo
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }} style={{ width: '100%', padding: '12px 15px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#333', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <Upload size={18} /> Upload Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Video Button with Dropdown */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowVideoMenu(!showVideoMenu)} style={{ padding: '15px 25px', background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '15px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Video size={20} /> Video
                </button>
                {showVideoMenu && (
                  <div style={{ position: 'absolute', top: '60px', left: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '12px', padding: '10px', zIndex: 1000, minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                    <button onClick={startVideoRecording} style={{ width: '100%', padding: '12px 15px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#333', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <Camera size={18} /> Record Video
                    </button>
                    <button onClick={() => { videoInputRef.current?.click(); setShowVideoMenu(false); }} style={{ width: '100%', padding: '12px 15px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#333', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <Upload size={18} /> Upload Video
                    </button>
                  </div>
                )}
              </div>

              <button onClick={isRecording ? stopRecording : startRecording} style={{ padding: '15px 25px', background: isRecording ? 'linear-gradient(135deg, #ff6b6b, #ee5a6f)' : 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '15px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: isRecording ? '0 0 20px rgba(255, 107, 107, 0.6)' : 'none', animation: isRecording ? 'pulse 2s ease-in-out infinite' : 'none' }}>
                {isRecording ? <Square size={20} /> : <Mic size={20} />}
                {isRecording ? 'Stop Recording' : 'Voice Note'}
              </button>
            </div>
            {mediaFiles.length > 0 && (
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
                {mediaFiles.map((file, index) => (
                  <div key={index} style={{ position: 'relative', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                    {file.type.startsWith('image/') && <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '5px' }} />}
                    {file.type.startsWith('video/') && <video src={URL.createObjectURL(file)} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '5px' }} />}
                    {file.type.startsWith('audio/') && <div style={{ fontSize: '40px', marginBottom: '5px' }}>🎤</div>}
                    <button onClick={() => removeMedia(index)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255, 0, 0, 0.8)', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={16} color="white" />
                    </button>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>{file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeIn 1s ease-out 0.7s backwards' }}>
            <button onClick={onCancel} style={{ padding: '16px 40px', background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '50px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}>
              Cancel
            </button>
            {!editingEntry && textContent && (
              <button 
                onClick={() => {
                  const templateName = title || `Custom Template ${customTemplates.length + 1}`;
                  addCustomTemplate({
                    id: `custom-${Date.now()}`,
                    name: templateName,
                    emoji: '📝',
                    description: 'Your custom template',
                    prompts: [],
                    structure: textContent,
                  });
                  alert(`✨ Template "${templateName}" saved! You can use it for future entries.`);
                }}
                style={{ 
                  padding: '16px 40px', 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  border: '2px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '50px', 
                  color: 'white', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={16} />
                Save as Template
              </button>
            )}
            <button onClick={handleSave} disabled={uploading} className="dashboard-new-entry-btn" style={{ fontSize: '16px', padding: '16px 50px' }}>
              <span>{uploading ? '💾 Saving...' : '✨ Release'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ambience Player */}
      <AmbiencePlayer isActive={true} />

      {/* Post-Entry Affirmation */}
      {showAffirmation && (
        <Affirmation onClose={() => {
          setShowAffirmation(false);
          // Show share option if entry was saved online
          if (savedEntryForSharing && currentEntry) {
            setShowShareModal(true);
          } else {
            onSave();
          }
        }} />
      )}

      {/* Share to Community Modal */}
      {showShareModal && savedEntryForSharing && currentEntry && currentEntry.mood && currentEntry.intensity && (
        <SharePostModal
          entryId={savedEntryForSharing.id}
          mood={currentEntry.mood}
          intensity={currentEntry.intensity}
          textContent={textContent}
          onClose={() => {
            setShowShareModal(false);
            onSave();
          }}
          onSuccess={() => {
            // Successfully shared
          }}
        />
      )}

      {/* Save Notification */}
      {saveNotification && (
        <SaveNotification
          type={saveNotification.type}
          message={saveNotification.message}
          onClose={() => setSaveNotification(null)}
        />
      )}
    </div>
  );
};

export default JournalEditor;
