export const timetableData = {
  // Definicje przedmiotów (kolory, prowadzący)
  SUBJECTS: {
    MAT01: {
      name: "Wstęp do matematyki inżynierskiej",
      teacher: "dr A. Pudełko / inni",
      color: "bg-amber-700",
    },
    ELEC01: {
      name: "Podstawy elektrotechniki",
      teacher: "prof. mgr Z. Saraczański / mgr inż. Z. Mielnik",
      color: "bg-orange-500",
    },
    MATLAB: {
      name: "Wprowadzenie do MATLAB",
      teacher: "dr inż. A. Dudziak / dr inż. S. Bortel / dr inż. A. Dziwisz",
      color: "bg-green-600",
    },
    ANG01: {
      name: "Język angielski",
      teacher: "lek. mgr J. Firląg / inni",
      color: "bg-sky-500",
    },
    PROG01: {
      name: "Podstawy programowania",
      teacher: "dr W. Pasierski",
      color: "bg-indigo-700",
    },
    WF: {
      name: "Wychowanie fizyczne",
      teacher: "dr J. Firląg",
      color: "bg-fuchsia-600",
    },
    // Nowe przedmioty dodane na podstawie obrazka
    REL01: {
      name: "Zajęcia relacji międzyludzkich z elementami etyki",
      teacher: "dr M. Piekarska",
      color: "bg-green-700",
    },
    FIZ01: {
      name: "Wstęp do fizyki inżynierskiej",
      teacher: "prof. A. Orzechowska / dr inż. E. Hawrysz",
      color: "bg-yellow-500",
    },
    ALGE01: {
      name: "Algebra liniowa",
      teacher: "dr M. Skrzyński / dr inż. K. Urbańska",
      color: "bg-red-900",
    },
  },

  // Szczegółowy harmonogram zajęć
  SCHEDULE: [
    // -----------------------------------------------------
    // 7:30 - 9:00
    // -----------------------------------------------------
    {
      id: 8,
      subj: "REL01",
      title: "Zagadnienia relacji międzyludzkich z elementami etyki",
      type: "Wykład",
      groups: [],
      day: 1, // Wtorek
      start: "07:30",
      end: "09:00",
      room: "C2",
      weeks: "both",
    },
    {
      id: 9,
      subj: "MAT01",
      title: "Wstęp do matematyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 2, // Środa
      start: "07:45",
      end: "10:00",
      room: "A1",
      weeks: "odd",
    },
    {
      id: 10, // Ten wpis jest dla tygodnia parzystego, ale zostaje dla spójności
      subj: "MAT01",
      title: "Wstęp do matematyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 2, // Środa
      start: "07:30",
      end: "09:00",
      room: "A1",
      weeks: "even",
    },
    {
      id: 10, // Ten wpis jest dla tygodnia parzystego, ale zostaje dla spójności
      subj: "MAT01",
      title: "Wstęp do matematyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć3"],
      day: 2, // Środa
      start: "07:45",
      end: "10:00",
      room: "A2",
      weeks: "odd",
    },
    {
      id: 100, // Ten wpis jest dla tygodnia parzystego, ale zostaje dla spójności
      subj: "MAT01",
      title: "Wstęp do matematyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć3"],
      day: 2, // Środa
      start: "07:45",
      end: "10:00",
      room: "A2",
      weeks: "even",
    },
    {
      id: 101,
      subj: "ELEC01",
      title: "Podstawy elektrotechniki",
      type: "Ćwiczenia",
      groups: ["Ć3"],
      day: 3, // Czwartek
      start: "07:30",
      end: "09:00",
      room: "A2",
      weeks: "both",
    },
    {
      id: 42,
      subj: "FIZ01",
      title: "Wstęp do fizyki inżynierskiej",
      type: "Laboratorium",
      groups: ["L1"],
      day: 4, // Piątek
      start: "07:30",
      end: "09:00",
      room: "F204",
      weeks: "odd",
    },

    // -----------------------------------------------------
    // 9:15 - 10:45
    // -----------------------------------------------------
    // ID 1, ID 6, ID 12, ID 13, ID 14, ID 15, ID 16, ID 17 są OK
    {
      id: 12,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk2"],
      day: 0, // Poniedziałek
      start: "09:15",
      end: "10:45",
      room: "E2",
      weeks: "both",
    },
    {
      id: 43,
      subj: "ALGE01",
      title: "Algebra liniowa",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 1, // Wtorek
      start: "09:15",
      end: "10:45",
      room: "A2",
      weeks: "both",
    },
    {
      id: 44,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk2"],
      day: 2, // Środa
      start: "09:15",
      end: "10:45",
      room: "E2",
      weeks: "odd", // Sprawdzone
    },

    // -----------------------------------------------------
    // 11:00 - 12:30
    // -----------------------------------------------------
    {
      id: 18,
      subj: "ALGE01",
      title: "Algebra liniowa",
      type: "Wykład",
      groups: ["C/E/k/U"],
      day: 0, // Poniedziałek
      start: "11:00",
      end: "12:30",
      room: "A2",
      weeks: "both",
    },
    {
      id: 19,
      subj: "ALGE01",
      title: "Algebra liniowa",
      type: "Ćwiczenia",
      groups: ["Ć1"],
      day: 1, // Wtorek
      start: "11:00",
      end: "12:30",
      room: "A2",
      weeks: "both",
    },
    {
      id: 20,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk1"],
      day: 2, // Środa
      start: "11:00",
      end: "12:30",
      room: "E2",
      weeks: "odd",
    },
    {
      id: 45,
      subj: "ANG01",
      title: "Język angielski",
      type: "Lektorat",
      groups: ["Lek2"],
      day: 3, // Czwartek
      start: "11:00",
      end: "12:30",
      room: "E4",
      weeks: "both", // Widoczne jako całe, ale u Ciebie było odd/even
    },

    // -----------------------------------------------------
    // 12:45 - 14:15
    // -----------------------------------------------------
    {
      id: 46,
      subj: "ELEC01",
      title: "Podstawy elektrotechniki",
      type: "Wykład",
      groups: ["C/E/k/U"],
      day: 0, // Poniedziałek
      start: "12:45",
      end: "14:15",
      room: "A2",
      weeks: "both",
    },
    {
      id: 47,
      subj: "ALGE01",
      title: "Algebra liniowa",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 1, // Wtorek
      start: "12:45",
      end: "14:15",
      room: "A2",
      weeks: "both",
    },
    {
      id: 48,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk3"],
      day: 2, // Środa
      start: "12:45",
      end: "14:15",
      room: "E2",
      weeks: "both",
    },
    {
      id: 49,
      subj: "MAT01",
      title: "Wstęp do matematyki inżynierskiej",
      type: "Wykład",
      groups: ["C/E/k/U"],
      day: 3, // Czwartek
      start: "12:45",
      end: "14:15",
      room: "A4",
      weeks: "both",
    },
    {
      id: 50,
      subj: "FIZ01",
      title: "Wstęp do fizyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć3"],
      day: 4, // Piątek
      start: "12:45",
      end: "14:15",
      room: "F203",
      weeks: "both",
    },

    // -----------------------------------------------------
    // 14:30 - 16:00
    // -----------------------------------------------------
    {
      id: 51,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Ćwiczenia",
      groups: ["C/E/k/U"],
      day: 0, // Poniedziałek
      start: "14:30",
      end: "16:00",
      room: "A2",
      weeks: "both",
    },
    {
      id: 52,
      subj: "ALGE01",
      title: "Algebra liniowa",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 1, // Wtorek
      start: "14:30",
      end: "16:00",
      room: "A2",
      weeks: "both",
    },
    {
      id: 53,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk4"],
      day: 2, // Środa
      start: "14:30",
      end: "16:00",
      room: "E2",
      weeks: "both",
    },
    {
      id: 54,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk7"],
      day: 3, // Czwartek
      start: "14:30",
      end: "16:00",
      room: "E2",
      weeks: "both",
    },
    {
      id: 55,
      subj: "ANG01",
      title: "Język angielski",
      type: "Lektorat",
      groups: ["Lek1"],
      day: 4, // Piątek
      start: "14:30",
      end: "16:00",
      room: "D4",
      weeks: "both",
    },

    // -----------------------------------------------------
    // 16:15 - 17:45
    // -----------------------------------------------------
    {
      id: 56,
      subj: "ELEC01",
      title: "Podstawy elektrotechniki",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 0, // Poniedziałek
      start: "16:15",
      end: "17:45",
      room: "A4",
      weeks: "both",
    },
    {
      id: 57,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk5"],
      day: 1, // Wtorek
      start: "16:15",
      end: "17:45",
      room: "E2",
      weeks: "both",
    },
    {
      id: 58,
      subj: "ELEC01",
      title: "Podstawy elektrotechniki",
      type: "Laboratorium",
      groups: ["Lab"],
      day: 2, // Środa
      start: "16:15",
      end: "17:45",
      room: "C4",
      weeks: "both",
    },
    {
      id: 59,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk8"],
      day: 3, // Czwartek
      start: "16:15",
      end: "17:45",
      room: "E2",
      weeks: "both",
    },

    // -----------------------------------------------------
    // 18:00 - 19:30
    // -----------------------------------------------------
    {
      id: 60,
      subj: "ELEC01",
      title: "Podstawy elektrotechniki",
      type: "Ćwiczenia",
      groups: ["Ć1"],
      day: 0, // Poniedziałek
      start: "18:00",
      end: "19:30",
      room: "A4",
      weeks: "both",
    },
    {
      id: 61,
      subj: "MATLAB",
      title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk6"],
      day: 1, // Wtorek
      start: "18:00",
      end: "19:30",
      room: "E2",
      weeks: "both",
    },
    {
      id: 62,
      subj: "ELEC01",
      title: "Podstawy elektrotechniki",
      type: "Ćwiczenia",
      groups: ["Ć4"],
      day: 2, // Środa
      start: "18:00",
      end: "19:30",
      room: "A4",
      weeks: "both",
    },
  ],
};
