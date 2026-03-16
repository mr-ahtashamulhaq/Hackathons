import React, { useState, useRef } from 'react';
import { appClient } from '@/lib/app-client';
import { Camera, Upload, Loader2, AlertCircle, CheckCircle2, ImagePlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import EmergencyBanner from '@/components/shared/EmergencyBanner';

export default function CameraInput() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setIsUploading(true);
    const { file_url } = await appClient.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setIsUploading(false);
  };

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    const response = await appClient.integrations.Core.InvokeLLM({
      prompt: `You are MAIA, a maternal health AI. Analyze this image from a pregnant/postpartum mother.
${description ? `Description: "${description}"` : ''}

Provide: 1) What you see 2) Concern level 3) Action: MONITOR/CALL PROVIDER/URGENT/EMERGENCY 4) Next steps. Be warm but brief.`,
      file_urls: [imageUrl],
    });

    setAnalysis(response);
    setIsAnalyzing(false);

    await appClient.entities.SymptomLog.create({
      symptoms: [description || 'Photo analysis'],
      severity: 'moderate',
      ai_assessment: response,
      photo_url: imageUrl,
      stage: 'prenatal'
    });
  };

  const reset = () => {
    setImage(null);
    setImageUrl('');
    setDescription('');
    setAnalysis(null);
  };

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => navigate('/Dashboard')} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-bold">Vision Scan</h1>
          <p className="text-xs text-muted-foreground">Analyze symptoms</p>
        </div>
      </div>
      <EmergencyBanner />

      <div className="px-5 space-y-4">
        {!image ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-8 border-2 border-dashed border-border flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <ImagePlus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-1">Upload or Take a Photo</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Capture a rash, swelling, wound, or any symptom you'd like analyzed
              </p>
              <div className="flex gap-3">
                <Button onClick={() => cameraInputRef.current?.click()} className="rounded-xl gap-2">
                  <Camera className="w-4 h-4" /> Take Photo
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl gap-2">
                  <Upload className="w-4 h-4" /> Upload
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="overflow-hidden">
              <img src={image} alt="Uploaded" className="w-full h-64 object-cover" />
              {isUploading && (
                <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </div>
              )}
            </Card>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're seeing or feeling (optional)..."
              className="rounded-xl border-border/60 min-h-[80px]"
            />

            <div className="flex gap-3">
              <Button
                onClick={analyzeImage}
                disabled={!imageUrl || isAnalyzing}
                className="flex-1 rounded-xl h-11 gap-2"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
              <Button variant="outline" onClick={reset} className="rounded-xl h-11">
                Retake
              </Button>
            </div>

            <AnimatePresence>
              {analysis && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-5 bg-muted/50">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      <h3 className="font-heading font-semibold">Analysis Results</h3>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{analysis}</p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}