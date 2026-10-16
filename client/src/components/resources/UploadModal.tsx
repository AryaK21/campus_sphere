import React, { useState, useEffect } from 'react';
import { Upload, FileUp, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Subject, ResourceType } from '../../types';
import { subjectsApi, resourcesApi } from '../../api/endpoints';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [semester, setSemester] = useState<number>(3);
  const [department, setDepartment] = useState('Computer Science');
  const [resourceType, setResourceType] = useState<ResourceType>('Notes');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('link');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      subjectsApi.getAll().then((res) => {
        if (res.data.success && res.data.data) {
          setSubjects(res.data.data.subjects);
          if (res.data.data.subjects.length > 0 && !subjectId) {
            setSubjectId(res.data.data.subjects[0]._id);
          }
        }
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!subjectId) {
      setError('Subject selection is required');
      return;
    }
    if (uploadMode === 'link' && !fileUrl.trim()) {
      setError('File link or cloud storage URL is required');
      return;
    }
    if (uploadMode === 'file' && !file) {
      setError('Please choose a file to upload');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subjectId', subjectId);
      formData.append('semester', semester.toString());
      formData.append('department', department);
      formData.append('resourceType', resourceType);

      if (uploadMode === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('fileUrl', fileUrl);
        formData.append('fileType', 'pdf');
      }

      const res = await resourcesApi.upload(formData);
      if (res.data.success) {
        onUploadSuccess();
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setFile(null);
        setFileUrl('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload course resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Academic Course Material">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Resource Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Unit 3 Dynamic Programming Hand-Written Notes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Subject Code & Title *
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                const sub = subjects.find((s) => s._id === e.target.value);
                if (sub) {
                  setSemester(sub.semester);
                  setDepartment(sub.department);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-xs"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} — {sub.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Resource Category *
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-xs"
            >
              <option value="Notes">Notes / Lecture Slides</option>
              <option value="PYQ">Previous Year Questions (PYQs)</option>
              <option value="LabManual">Lab Manual / Code Guide</option>
              <option value="PPT">Presentation PPT</option>
              <option value="Syllabus">Syllabus Copy</option>
              <option value="ReferenceBook">Reference E-Book</option>
              <option value="Assignment">Assignment Solution</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Semester (1 - 8)
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Brief Description (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Key topics covered, chapters, or syllabus mapping..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Upload Source Toggle */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                uploadMode === 'link'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Direct URL / Cloud Link
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                uploadMode === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" /> Local File Upload (Multer)
            </button>
          </div>

          {uploadMode === 'link' ? (
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Document File URL / Drive Link *
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or https://assets.campus.edu/notes.pdf"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
              />
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-indigo-500"
              >
                <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                <span className="font-bold text-xs text-gray-700 dark:text-gray-200">
                  {file ? file.name : 'Choose file (PDF, PPT, DOCX, ZIP)'}
                </span>
                <span className="text-[10px] text-gray-400">Max size: 25MB</span>
              </label>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="md"
            type="submit"
            isLoading={isLoading}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Publish Material
          </Button>
        </div>
      </form>
    </Modal>
  );
};
