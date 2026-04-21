/**
 * Centralized service to handle integration with cinema databases.
 * In a production app, these would be real HTTP calls to a backend.
 */

const INITIAL_THEATERS = [
    { id: 1, name: "Grand Cinema Rex", location: "Downtown Mall", city: "Mumbai", formats: ["4DX", "IMAX", "2D"], rows: 8, cols: 12, price: 150, distance: 1.2 },
    { id: 2, name: "Starlight Cineplex", location: "Sunset Boulevard", city: "Delhi", formats: ["IMAX", "3D"], rows: 6, cols: 10, price: 180, distance: 3.5 },
    { id: 3, name: "NeoVerse Theaters", location: "Tech Hub Plaza", city: "Bengaluru", formats: ["ScreenX", "2D"], rows: 10, cols: 15, price: 200, distance: 0.8 },
    { id: 4, name: "PVR Heritage", location: "Old Town Market", city: "Mumbai", formats: ["2D", "3D"], rows: 9, cols: 14, price: 220, distance: 5.2 },
    { id: 5, name: "Inox Megaplex", location: "Crystal Galleria", city: "Pune", formats: ["IMAX", "Director's Cut"], rows: 12, cols: 20, price: 450, distance: 2.1 },
    { id: 6, name: "Galaxy Cinemas", location: "Hill View Mall", city: "Hyderabad", formats: ["2D", "3D"], rows: 8, cols: 12, price: 200, distance: 4.1 },
    { id: 7, name: "Croma Screens", location: "Silver Plaza", city: "Delhi", formats: ["2D"], rows: 7, cols: 12, price: 150, distance: 1.5 },
    { id: 8, name: "Pink City Talkies", location: "Johri Bazaar", city: "Jaipur", formats: ["2D"], rows: 10, cols: 12, price: 120, distance: 1.1 },
    { id: 9, name: "Nawab Screens", location: "Hazratganj", city: "Lucknow", formats: ["IMAX", "2D"], rows: 8, cols: 15, price: 250, distance: 2.4 },
    { id: 10, name: "CineCoast", location: "Marine Drive", city: "Kochi", formats: ["3D", "2D"], rows: 6, cols: 10, price: 180, distance: 0.5 },
    { id: 11, name: "Sukhna Cinema", location: "Sector 17", city: "Chandigarh", formats: ["2D"], rows: 8, cols: 12, price: 200, distance: 3.2 },
    { id: 12, name: "Diamond Cinemas", location: "Ring Road", city: "Surat", formats: ["4DX", "2D"], rows: 10, cols: 14, price: 280, distance: 1.8 },
    { id: 13, name: "Orange Cineplex", location: "Civil Lines", city: "Nagpur", formats: ["2D"], rows: 8, cols: 10, price: 150, distance: 4.5 },
    { id: 14, name: "Riverview Multiplex", location: "Gandhi Maidan", city: "Patna", formats: ["2D", "3D"], rows: 12, cols: 12, price: 130, distance: 2.1 },
    { id: 15, name: "Temple City Imax", location: "Meenakshi Mall", city: "Madurai", formats: ["IMAX", "2D"], rows: 10, cols: 18, price: 300, distance: 1.4 },
    { id: 16, name: "Coastal Screens", location: "RK Beach", city: "Visakhapatnam", formats: ["2D", "3D"], rows: 8, cols: 12, price: 180, distance: 0.9 },
    { id: 17, name: "Holy City Talkies", location: "Ghat Road", city: "Varanasi", formats: ["2D"], rows: 10, cols: 10, price: 110, distance: 3.3 },
    { id: 18, name: "Golden Screen", location: "Golden Temple Road", city: "Amritsar", formats: ["2D", "3D"], rows: 8, cols: 15, price: 160, distance: 1.2 },
    { id: 19, name: "Steel City Inox", location: "Bistupur", city: "Jamshedpur", formats: ["2D"], rows: 9, cols: 12, price: 190, distance: 2.5 },
    { id: 20, name: "Lake City Cinemas", location: "Fateh Sagar", city: "Udaipur", formats: ["2D"], rows: 7, cols: 10, price: 210, distance: 4.7 }
];

const INITIAL_SCHEDULES = [
    { id: 101, movieId: "1126166", theaterId: 1, time: "01:45 PM" }, // Project Hail Mary (assuming ID)
    { id: 102, movieId: "1126166", theaterId: 2, time: "05:45 PM" },
];

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const cinemaService = {
    /**
     * Fetches theaters from the backend API with city filtering.
     */
    async fetchTheaters(selectedCity = null) {
        try {
            const response = await axios.get(`${API_URL}/theaters`, {
                params: { city: selectedCity }
            });
            
            let theaters = response.data;

            // Dynamic Generation Fallback (if backend has no data for this new city yet)
            if (selectedCity && theaters.length === 0) {
                const dynamicTheaters = [
                    { 
                        name: `${selectedCity} PVR`, 
                        location: "Main Street Mall", 
                        city: selectedCity, 
                        formats: ["IMAX", "2D"], 
                        rows: 8, cols: 12, price: 150, distance: 1.5 
                    },
                    { 
                        name: `${selectedCity} Inox`, 
                        location: "Central Garden Plaza", 
                        city: selectedCity, 
                        formats: ["4DX", "3D"], 
                        rows: 10, cols: 15, price: 180, distance: 2.8 
                    }
                ];
                
                // Auto-seed the backend with these dynamic theaters for future use
                for (const t of dynamicTheaters) {
                    await axios.post(`${API_URL}/theaters`, t).catch(console.error);
                }
                
                const retryResponse = await axios.get(`${API_URL}/theaters`, { params: { city: selectedCity } });
                theaters = retryResponse.data;
            }

            return theaters;
        } catch (err) {
            console.error('Failed to fetch theaters from API:', err);
            // Fallback to initial local data if API fails
            return INITIAL_THEATERS.filter(t => !selectedCity || t.city.toLowerCase() === selectedCity.toLowerCase());
        }
    },

    /**
     * Fetches movie schedules for a specific movie ID or all schedules.
     */
    async fetchSchedules(movieId = null) {
        await new Promise(r => setTimeout(r, 800));
        const saved = localStorage.getItem('cinema_schedules');
        let schedules = saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
        
        if (movieId) {
            return schedules.filter(s => s.movieId.toString() === movieId.toString());
        }
        return schedules;
    },

    /**
     * Synchronizes new data to the "Cinema Database".
     */
    async syncData(theaters, schedules) {
        await new Promise(r => setTimeout(r, 1000));
        localStorage.setItem('cinema_theaters', JSON.stringify(theaters));
        localStorage.setItem('cinema_schedules', JSON.stringify(schedules));
        return { success: true, timestamp: new Date().toISOString() };
    }
};
