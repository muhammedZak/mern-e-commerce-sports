import React from 'react';
import { useParams } from 'react-router-dom';

export default function ProductDetailsPage() {
  const { slug } = useParams();

  return (
    <div>
      ProductDetailsPage
      <p>{slug}</p>
    </div>
  );
}
