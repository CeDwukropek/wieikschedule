export const timetableData = {
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
    METS: {
      name: "Metodyka studiowania",
      teacher: "dr M. Piekarski",
      color: "bg-blue-900",
    },
  },
  SCHEDULE: [
    // -----------------------------------------------------
    // 7:30 - 9:00
    // -----------------------------------------------------
    {
      id: 8,
      subj: "METS",
      // Usunięto: title: "Zagadnienia relacji międzyludzkich z elementami etyki",
      type: "Wykład",
      groups: [],
      day: 0, // Wtorek
      start: "07:30",
      end: "09:00",
      room: "A1",
      weeks: "odd",
    },
    {
      id: 8,
      subj: "REL01",
      // Usunięto: title: "Zagadnienia relacji międzyludzkich z elementami etyki",
      type: "Wykład",
      groups: [],
      day: 1, // Wtorek
      start: "07:30",
      end: "09:00",
      room: "A1",
      weeks: "odd",
    },
    {
      id: 9,
      subj: "MAT01",
      // Usunięto: title: "Wstęp do matematyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 2, // Środa
      start: "07:45",
      end: "10:00",
      room: "A1",
      weeks: "both",
    },

    {
      id: 100, // Ten wpis jest dla tygodnia parzystego, ale zostaje dla spójności
      subj: "MAT01",
      // Usunięto: title: "Wstęp do matematyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć3"],
      day: 2, // Środa
      start: "07:45",
      end: "10:00",
      room: "A2",
      weeks: "both",
    },
    {
      id: 101,
      subj: "ELEC01",
      // Usunięto: title: "Podstawy elektrotechniki",
      type: "Ćwiczenia",
      groups: ["Ć3"],
      day: 3, // Czwartek
      start: "07:30",
      end: "09:00",
      room: "A2",
      weeks: "both",
    },

    // -----------------------------------------------------
    // 9:15 - 10:45
    // -----------------------------------------------------
    // ID 1, ID 6, ID 12, ID 13, ID 14, ID 15, ID 16, ID 17 są OK
    {
      id: 1,
      subj: "MAT01",
      // Usunięto: title: "Wstęp do matematyki",
      type: "Wykład",
      groups: [],
      day: 0,
      start: "09:15",
      end: "10:45",
      room: "A4",
      weeks: "both",
    },
    {
      id: 6,
      subj: "ALGE01",
      // Usunięto: title: "Język angielski",
      type: "Ćwiczenia",
      groups: ["Ć3"],
      day: 1, // Wtorek
      start: "09:15",
      end: "10:45",
      room: "A2",
      weeks: "both",
    },
    {
      id: 43,
      subj: "MATLAB",
      // Usunięto: title: "Algebra liniowa",
      type: "Laboratorium",
      groups: ["Lk2"],
      day: 1, // Wtorek
      start: "9:15",
      end: "10:45",
      room: "12",
      weeks: "both",
    },
    {
      id: 44,
      subj: "MAT01",
      // Usunięto: title: "Wprowadzenie do MATLAB-a",
      type: "Ćwiczenia",
      groups: ["Ć1"],
      day: 2, // Środa
      start: "10:15",
      end: "12:30",
      room: "A2",
      weeks: "both", // Sprawdzone
    },
    {
      id: 44,
      subj: "MAT01",
      // Usunięto: title: "Wprowadzenie do MATLAB-a",
      type: "Ćwiczenia",
      groups: ["Ć4"],
      day: 2, // Środa
      start: "10:15",
      end: "12:30",
      room: "A1",
      weeks: "both", // Sprawdzone
    },
    {
      id: 16,
      subj: "ANG01",
      // Usunięto: title: "Język angielski",
      type: "Lektorat",
      groups: ["Lek2"],
      day: 3,
      start: "09:15",
      end: "10:45",
      room: "139SJO",
      weeks: "both",
    },
    {
      id: 17,
      subj: "FIZ01",
      // Usunięto: title: "Wstęp do fizyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć1"],
      day: 4,
      start: "09:15",
      end: "10:45",
      room: "F101",
      weeks: "both",
    },
    {
      id: 170,
      subj: "FIZ01",
      // Usunięto: title: "Wstęp do fizyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 4,
      start: "09:15",
      end: "10:45",
      room: "F204",
      weeks: "both",
    },
    {
      id: 180,
      subj: "FIZ01",
      // Usunięto: title: "Wstęp do fizyki inżynierskiej",
      type: "Ćwiczenia",
      groups: ["Ć4"],
      day: 4,
      start: "08:45",
      end: "10:15",
      room: "F203",
      weeks: "both",
    },

    // -----------------------------------------------------
    // 11:00 - 12:30
    // -----------------------------------------------------
    {
      id: 18,
      subj: "ALGE01",
      // Usunięto: title: "Algebra liniowa",
      type: "Wykład",
      groups: [],
      day: 0, // Poniedziałek
      start: "11:00",
      end: "12:30",
      room: "A2",
      weeks: "both",
    },
    {
      id: 19,
      subj: "ALGE01",
      // Usunięto: title: "Algebra liniowa",
      type: "Ćwiczenia",
      groups: ["Ć1"],
      day: 1, // Wtorek
      start: "11:00",
      end: "12:30",
      room: "A2",
      weeks: "both",
    },
    {
      id: 19,
      subj: "ELEC01",
      // Usunięto: title: "Algebra liniowa",
      type: "Laboratoria",
      groups: ["L10"],
      day: 1, // Wtorek
      start: "11:00",
      end: "12:30",
      room: "O4",
      weeks: "odd",
    },
    {
      id: 19,
      subj: "MATLAB",
      // Usunięto: title: "Algebra liniowa",
      type: "Laboratorium",
      groups: ["Lk4"],
      day: 1, // Wtorek
      start: "11:00",
      end: "12:30",
      room: "12",
      weeks: "both",
    },
    {
      id: 45,
      subj: "ANG01",
      // Usunięto: title: "Język angielski",
      type: "Lektorat",
      groups: ["Lek3"],
      day: 3, // Czwartek
      start: "11:00",
      end: "12:30",
      room: "139SJO",
      weeks: "both", // Widoczne jako całe, ale u Ciebie było odd/even
    },
    {
      id: 45,
      subj: "ANG01",
      // Usunięto: title: "Język angielski",
      type: "Lektorat",
      groups: ["Lek4"],
      day: 3, // Czwartek
      start: "11:00",
      end: "12:30",
      room: "150SJO",
      weeks: "both", // Widoczne jako całe, ale u Ciebie było odd/even
    },
    {
      id: 45,
      subj: "ANG01",
      // Usunięto: title: "Język angielski",
      type: "Lektorat",
      groups: ["Lek"],
      day: 3, // Czwartek
      start: "11:00",
      end: "12:30",
      room: "138SJO",
      weeks: "both", // Widoczne jako całe, ale u Ciebie było odd/even
    },
    {
      id: 45,
      subj: "ELEC01",
      // Usunięto: title: "Język angielski",
      type: "Lektorat",
      groups: ["L1"],
      day: 3, // Czwartek
      start: "11:00",
      end: "12:30",
      room: "O4",
      weeks: "odd", // Widoczne jako całe, ale u Ciebie było odd/even
    },
    {
      id: 45,
      subj: "ELEC01",
      // Usunięto: title: "Język angielski",
      type: "Lektorat",
      groups: ["L2"],
      day: 3, // Czwartek
      start: "11:00",
      end: "12:30",
      room: "O4",
      weeks: "even", // Widoczne jako całe, ale u Ciebie było odd/even
    },
    {
      id: 24,
      subj: "FIZ01",
      // Usunięto: title: "Wstęp do fizyki inżynierskiej",
      type: "Wykład",
      groups: [],
      day: 4,
      start: "11:00",
      end: "12:30",
      room: "F101",
      weeks: "both",
    },

    // -----------------------------------------------------
    // 12:45 - 14:15
    // -----------------------------------------------------
    {
      id: 46,
      subj: "ELEC01",
      // Usunięto: title: "Podstawy elektrotechniki",
      type: "Wykład",
      groups: [],
      day: 0, // Poniedziałek
      start: "12:45",
      end: "14:15",
      room: "A2",
      weeks: "both",
    },
    {
      id: 47,
      subj: "ALGE01",
      // Usunięto: title: "Algebra liniowa",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 1, // Wtorek
      start: "12:45",
      end: "14:15",
      room: "A2",
      weeks: "both",
    },
    {
      id: 47,
      subj: "ELEC01",
      // Usunięto: title: "Algebra liniowa",
      type: "Laboratoria",
      groups: ["L9"],
      day: 1, // Wtorek
      start: "12:45",
      end: "14:15",
      room: "O4",
      weeks: "odd",
    },
    {
      id: 48,
      subj: "MATLAB",
      // Usunięto: title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk5"],
      day: 1, // Wtorek
      start: "12:45",
      end: "14:15",
      room: "12",
      weeks: "both",
    },

    {
      id: 49,
      subj: "MAT01",
      // Usunięto: title: "Wstęp do matematyki inżynierskiej",
      type: "Wykład",
      groups: [],
      day: 2, // Środa
      start: "12:45",
      end: "14:15",
      room: "A4",
      weeks: "both",
    },
    {
      id: 49,
      subj: "ANG01",
      // Usunięto: title: "Wstęp do matematyki inżynierskiej",
      type: "Lektorat",
      groups: ["Lek5"],
      day: 3, // Środa
      start: "12:45",
      end: "14:15",
      room: "139SJO",
      weeks: "both",
    },
    {
      id: 49,
      subj: "ANG01",
      // Usunięto: title: "Wstęp do matematyki inżynierskiej",
      type: "Lektorat",
      groups: ["Lek6"],
      day: 3, // Środa
      start: "12:45",
      end: "14:15",
      room: "150SJO",
      weeks: "both",
    },
    {
      id: 49,
      subj: "ELEC01",
      // Usunięto: title: "Wstęp do matematyki inżynierskiej",
      type: "Laboratorium",
      groups: ["L4"],
      day: 3, // Środa
      start: "12:45",
      end: "14:15",
      room: "A4",
      weeks: "even",
    },
    {
      id: 49,
      subj: "ELEC01",
      // Usunięto: title: "Wstęp do matematyki inżynierskiej",
      type: "Laboratorium",
      groups: ["L3"],
      day: 3, // Środa
      start: "12:45",
      end: "14:15",
      room: "A4",
      weeks: "odd",
    },
    {
      id: 50,
      subj: "FIZ01",
      // Usunięto: title: "Wstęp do fizyki inżynierskiej",
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
      // Usunięto: title: "Wprowadzenie do MATLAB-a",
      type: "Wykład",
      groups: [],
      day: 0, // Poniedziałek
      start: "14:30",
      end: "16:00",
      room: "A2",
      weeks: "both",
    },
    {
      id: 52,
      subj: "ALGE01",
      // Usunięto: title: "Algebra liniowa",
      type: "Ćwiczenia",
      groups: ["Ć4"],
      day: 1, // Wtorek
      start: "14:30",
      end: "16:00",
      room: "A2",
      weeks: "both",
    },
    {
      id: 47,
      subj: "ELEC01",
      // Usunięto: title: "Algebra liniowa",
      type: "Laboratoria",
      groups: ["L7"],
      day: 1, // Wtorek
      start: "14:30",
      end: "16:00",
      room: "O4",
      weeks: "odd",
    },
    {
      id: 53,
      subj: "MATLAB",
      // Usunięto: title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk6"],
      day: 1, // Wtorek
      start: "14:30",
      end: "16:00",
      room: "12",
      weeks: "both",
    },

    {
      id: 54,
      subj: "MATLAB",
      // Usunięto: title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk7"],
      day: 2, // Czwartek
      start: "14:30",
      end: "16:00",
      room: "12",
      weeks: "both",
    },
    {
      id: 55,
      subj: "ANG01",
      // Usunięto: title: "Język angielski",
      type: "Lektorat",
      groups: ["Lek1"],
      day: 3, // Piątek
      start: "14:30",
      end: "16:00",
      room: "150SJO",
      weeks: "both",
    },
    {
      id: 55,
      subj: "ELEC01",
      // Usunięto: title: "Język angielski",
      type: "Laboratorium",
      groups: ["L6"],
      day: 3, // Piątek
      start: "14:30",
      end: "16:00",
      room: "O4",
      weeks: "even",
    },
    {
      id: 55,
      subj: "ELEC01",
      // Usunięto: title: "Język angielski",
      type: "Laboratorium",
      groups: ["L5"],
      day: 3, // Piątek
      start: "14:30",
      end: "16:00",
      room: "O4",
      weeks: "odd",
    },

    // -----------------------------------------------------
    // 16:15 - 17:45
    // -----------------------------------------------------
    {
      id: 56,
      subj: "ELEC01",
      // Usunięto: title: "Podstawy elektrotechniki",
      type: "Ćwiczenia",
      groups: ["Ć1"],
      day: 0, // Poniedziałek
      start: "16:15",
      end: "17:45",
      room: "9",
      weeks: "both",
    },
    {
      id: 57,
      subj: "MATLAB",
      // Usunięto: title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk3"],
      day: 0, // Wtorek
      start: "16:15",
      end: "17:45",
      room: "12",
      weeks: "both",
    },
    {
      id: 58,
      subj: "ELEC01",
      // Usunięto: title: "Podstawy elektrotechniki",
      type: "Laboratorium",
      groups: ["L11"],
      day: 1, // Środa
      start: "16:15",
      end: "18:30",
      room: "O4",
      weeks: "even",
    },
    {
      id: 58,
      subj: "ELEC01",
      // Usunięto: title: "Podstawy elektrotechniki",
      type: "Laboratorium",
      groups: ["L8"],
      day: 1, // Środa
      start: "16:15",
      end: "17:45",
      room: "O4",
      weeks: "odd",
    },
    {
      id: 62,
      subj: "ELEC01",
      // Usunięto: title: "Podstawy elektrotechniki",
      type: "Ćwiczenia",
      groups: ["Ć4"],
      day: 2, // Środa
      start: "17:00",
      end: "18:30",
      room: "9",
      weeks: "both",
    },

    // -----------------------------------------------------
    // 18:00 - 19:30
    // -----------------------------------------------------
    {
      id: 60,
      subj: "ELEC01",
      // Usunięto: title: "Podstawy elektrotechniki",
      type: "Ćwiczenia",
      groups: ["Ć2"],
      day: 0, // Poniedziałek
      start: "18:00",
      end: "19:30",
      room: "A2",
      weeks: "both",
    },
    {
      id: 61,
      subj: "MATLAB",
      // Usunięto: title: "Wprowadzenie do MATLAB-a",
      type: "Laboratorium",
      groups: ["Lk1"],
      day: 0, // Wtorek
      start: "18:00",
      end: "19:30",
      room: "12",
      weeks: "both",
    },
  ],
};
