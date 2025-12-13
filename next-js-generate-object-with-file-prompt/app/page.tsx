'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Page() {
  const [description, setDescription] = useState<string>();
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.container}>
      <form
        className={styles.form}
        action={async formData => {
          try {
            setLoading(true);
            const response = await fetch('/api/analyze', {
              method: 'POST',
              body: formData,
            });
            setLoading(false);

            if (response.ok) {
              setDescription(await response.text());
            }
          } catch (error) {
            console.error('Analysis failed:', error);
          }
        }}
      >
        <div className={styles.formGroup}>
          <label className={styles.label}>Upload PDF</label>
          <input
            className={styles.fileInput}
            name="pdf"
            type="file"
            accept="application/pdf"
          />
        </div>
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {description && (
        <div className={styles.resultContainer}>
          <pre className={styles.resultPre}>
            {JSON.stringify(JSON.parse(description), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
