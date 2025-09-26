'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Bell, 
  User, 
  Users, 
  GraduationCap,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  X
} from 'lucide-react';

// Types
interface Event {
  id: number;
  title: string;
  department: 'cs' | 'se' | 'is';
  description: string;
  date: string;
  time: string;
  location: string;
  maxReg: number;
  currentReg: number;
}

interface EventFormData {
  title: string;
  department: 'cs' | 'se' | 'is' | '';
  description: string;
  date: string;
  time: string;
  location: string;
  maxReg: number;
}