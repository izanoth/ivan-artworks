'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


type Comment = {
  name: string;
  message: string;
  timestamp: string;
};

export default function Comments() {
}