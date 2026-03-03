import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { loginUser } from "../../../services/api";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import {
  motion as Motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import animConfig from "../../../config/animationConfig.json";

// --- HOOKS ---

// Hook for smooth mouse tracking with optional delay/stiffness
function useMousePosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const updateMouse = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, [x, y]);

  return { x, y };
}

// Hook for calculating vector to a target element
function useVectorToTarget(targetRef) {
  const [targetCenter, setTargetCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!targetRef.current) return;

    const updateCenter = () => {
      const rect = targetRef.current.getBoundingClientRect();
      setTargetCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    };

    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, [targetRef]);

  return targetCenter;
}

// --- COMPONENTS ---

const Eyebrow = ({ expression = "neutral", color = "black" }) => {
  const variants = {
    neutral: { y: 0, rotate: 0 },
    curious: { y: -8, rotate: -15 },
    surprised: { y: -12, rotate: 0 },
    suspicious: { y: 4, rotate: 15 },
    shy: { y: 2, rotate: 8 },
    focus: { y: 5, rotate: 5 },
    happy: { y: -5, rotate: 0 },
    angry: { y: 5, rotate: 25 },
    raisedOne: { y: -6, rotate: -15 }, // The Rock style
    raisedBoth: { y: -8, rotate: 0 },
    arrogant: { y: -4, rotate: -5 },
  };

  return (
    <Motion.div
      className="w-6 h-2 rounded-full"
      style={{ backgroundColor: color }}
      variants={variants}
      animate={expression}
      transition={animConfig.expressionTransition}
    />
  );
};

const EyeBall = ({
  scale = 1.5,
  size = 32,
  pupilSize = 10,
  eyeColor = "white",
  pupilColor = "#2D2D2D",
  mouseX,
  mouseY,
  forceLook, // {x, y} relative vector or absolute override
  blinkState = false,
  expression = "neutral",
  delay = 0,
  targetCenter, // {x, y} of the target to look at (e.g. email input)
}) => {
  const finalSize = size * scale;
  const finalPupilSize = pupilSize * scale;

  const eyeRef = useRef(null);
  const [eyeCenter, setEyeCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (eyeRef.current) {
      const rect = eyeRef.current.getBoundingClientRect();
      setEyeCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, []);

  // Calculate pupil position based on mode
  const pupilX = useTransform(mouseX, (xVal) => {
    if (forceLook) return forceLook.x * (finalSize / 4);

    // If we have a target center (e.g. looking at email input), calculate vector
    if (targetCenter && expression === "focus" && !forceLook) {
      // 'focus' for email logic
      const dx = targetCenter.x - eyeCenter.x;
      // Constrain movement to form area loosely
      return Math.max(-finalSize / 2.5, Math.min(finalSize / 2.5, dx / 20));
    }

    const delta = xVal - eyeCenter.x;
    return Math.max(-finalSize / 3, Math.min(finalSize / 3, delta / 15));
  });

  const pupilY = useTransform(mouseY, (yVal) => {
    if (forceLook) return forceLook.y * (finalSize / 4);

    if (targetCenter && expression === "focus" && !forceLook) {
      const dy = targetCenter.y - eyeCenter.y;
      return Math.max(-finalSize / 2.5, Math.min(finalSize / 2.5, dy / 20));
    }

    const delta = yVal - eyeCenter.y;
    return Math.max(-finalSize / 3, Math.min(finalSize / 3, delta / 15));
  });

  const smoothPupilX = useSpring(pupilX, {
    ...animConfig.eyeTracking,
    mass: 0.5 + delay,
  });
  const smoothPupilY = useSpring(pupilY, {
    ...animConfig.eyeTracking,
    mass: 0.5 + delay,
  });

  const eyelidVariants = {
    open: { height: 0 },
    blink: { height: "100%" },
    squint: { height: "45%" },
    wide: { height: 0 },
    shy: { height: "60%" },
    closed: { height: "100%" },
    halfClosed: { height: "40%" }, // For dismissive/bored look
    arrogant: { height: "30%" }, // Slightly lowered lids
  };

  const currentEyelidState = blinkState
    ? "blink"
    : expression === "suspicious"
    ? "squint"
    : expression === "focus" ||
      expression === "arrogant" ||
      expression === "jutek"
    ? "arrogant"
    : expression === "surprised" || expression === "curious"
    ? "wide"
    : expression === "shy"
    ? "shy"
    : expression === "dismissive"
    ? "halfClosed"
    : "open";

  return (
    <Motion.div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center overflow-hidden relative shadow-sm border border-black/5"
      style={{
        width: finalSize,
        height: finalSize,
        backgroundColor: eyeColor,
      }}
    >
      <Motion.div
        className="rounded-full absolute flex items-center justify-center"
        style={{
          width: finalPupilSize,
          height: finalPupilSize,
          backgroundColor: pupilColor,
          x: smoothPupilX,
          y: smoothPupilY,
        }}
      >
        <div className="absolute top-1 right-1 w-[35%] h-[35%] bg-white rounded-full opacity-80 blur-[0.5px]" />
        <div className="absolute bottom-1 left-1 w-[15%] h-[15%] bg-white rounded-full opacity-40 blur-[0.5px]" />
      </Motion.div>

      <Motion.div
        className="absolute top-0 left-0 w-full z-10"
        style={{
          backgroundColor: pupilColor === "#2D2D2D" ? "#2D2D2D" : "#1a1a1a",
        }}
        animate={currentEyelidState}
        variants={eyelidVariants}
        transition={{
          duration: 0.15,
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
      />
    </Motion.div>
  );
};

// Moved paths outside to prevent recreation on render
const MOUTH_PATHS = {
  neutral: "M 4 8 Q 12 12 20 8",
  happy: "M 2 6 Q 12 20 22 6",
  curious: "M 8 8 Q 12 4 16 8",
  surprised: "M 6 4 Q 12 18 18 4",
  suspicious: "M 4 10 L 20 10",
  focus: "M 8 10 L 16 10",
  shy: "M 6 8 Q 12 14 18 8",
  laugh: "M 2 6 Q 12 22 22 6", // Removed Z to keep it simple path
  angry: "M 4 12 Q 12 6 20 12",
  sneer: "M 4 10 Q 12 6 20 12", // Asymmetrical frown/sneer
  pucker: "M 10 8 Q 12 6 14 8", // Small whistle mouth
  thinSmile: "M 6 10 Q 12 11 18 10", // Very subtle smile
  jutek: "M 6 12 Q 12 8 18 12", // Frown
  arrogant: "M 6 10 Q 12 11 18 10", // Same as thinSmile for now
};

const Mouth = ({ expression = "neutral", color = "black" }) => {
  // Ensure we always have a valid path string
  const currentPath =
    (expression && MOUTH_PATHS[expression]) ||
    MOUTH_PATHS.neutral ||
    "M 4 8 Q 12 12 20 8";

  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      className="overflow-visible"
    >
      <Motion.path
        d={currentPath}
        fill={
          expression === "laugh" ||
          expression === "happy" ||
          expression === "surprised"
            ? "#333"
            : "transparent"
        }
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ d: currentPath }}
        transition={animConfig.expressionTransition}
      />
    </svg>
  );
};

const Hands = ({ show = false, color }) => {
  return (
    <Motion.div
      className="absolute top-[70px] left-0 w-full flex justify-center gap-8 pointer-events-none z-20"
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: show ? 0 : 100,
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0.8,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      <div
        className="w-10 h-10 rounded-full shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div
        className="w-10 h-10 rounded-full shadow-sm"
        style={{ backgroundColor: color }}
      />
    </Motion.div>
  );
};

const Character = ({
  color,
  width,
  height,
  borderRadius,
  zIndex,
  left,
  mouseX,
  mouseY,
  delay = 0,
  children,
  focusState,
  showPassword,
  distracted = false, // Is the character currently distracted (looking at neighbor)?
  distractionDirection = { x: 0, y: 0 },
  peekState = false, // Is peeking at password
}) => {
  // --- BODY SWAY (Static) ---
  // Body is static as requested ("tegak", "diam di tempat")
  // Only breathing animation applies

  // Breathing animation (micro-movement) for Body
  const breathing = {
    y: focusState === "email" ? [0, -0.5, 0] : [0, -1, 0], // Very subtle
    scale: [1, 1.002, 1],
    transition: {
      duration: focusState === "email" ? 2 : 3 + delay * 0.25,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    },
  };

  const isShy = focusState === "password" && !showPassword;
  const isReveal = showPassword && focusState === "password";

  // --- HEAD TRACKING (Continuous) ---
  // Map mouse position to head rotation/translation
  const headX = useTransform(mouseX, [0, window.innerWidth], [-5, 5]);
  const headY = useTransform(mouseY, [0, window.innerHeight], [-5, 5]);
  const headRotateY = useTransform(mouseX, [0, window.innerWidth], [-15, 15]); // Left/Right look
  const headRotateX = useTransform(mouseY, [0, window.innerHeight], [10, -10]); // Up/Down look (0=Top=Up)

  // Use stiffness/damping from config to match cursor speed "beriringan"
  const smoothHeadX = useSpring(headX, animConfig.headTracking);
  const smoothHeadY = useSpring(headY, animConfig.headTracking);
  const smoothHeadRotateY = useSpring(headRotateY, animConfig.headTracking);
  const smoothHeadRotateX = useSpring(headRotateX, animConfig.headTracking);

  // --- HEAD STATES ---
  const headVariants = {
    idle: {
      rotate: 0,
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      transition: { duration: 0.5 },
    },
    // When focused on input (not idle/freeroam), fix the head position
    focused: {
      rotate: 0,
      rotateX: 5, // Slight tilt down towards form
      rotateY: 0,
      x: 0,
      y: 0,
    },
    shy: {
      rotate: 0,
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      transition: {
        duration: 0, // Disable transition movement
      },
    },
    distracted: {
      rotate: distractionDirection.x * 2,
      rotateY: distractionDirection.x * 20, // Look at neighbor
      rotateX: 0,
      x: distractionDirection.x * 2,
      y: 0,
    },

    // Password Reveal Mode: Turn Head Away
    revealTurn: {
      rotate: 5,
      rotateY: animConfig.passwordBehavior.visible.turnAngle, // Strong turn
      rotateX: 5, // Slight tilt up/arrogant
      x: -5,
      y: 0,
      transition: {
        duration: 0.6, // Normal speed (0.6s)
        type: "tween",
        ease: "easeInOut",
      },
    },
    // Peek back at password form
    peek: {
      rotate: 5, // Keep same as revealTurn
      rotateY: animConfig.passwordBehavior.visible.turnAngle, // Keep turned away!
      rotateX: 5, // Keep same as revealTurn
      x: -5, // Keep same as revealTurn
      y: 0, // Keep same as revealTurn
      transition: {
        // Normal peeking transition (0.6s, ease-in-out)
        duration: 0.6,
        type: "tween",
        ease: "easeInOut",
      },
    },
  };

  let currentHeadVariant = null; // Default: Track mouse (if not forced)

  // If NOT in freeroam (focusState !== 'idle'), stop tracking (use focused variant)
  if (focusState !== "idle") {
    currentHeadVariant = "focused";
  }

  // REQ 2: Flag boolean isPeeking
  const isPeeking = peekState;

  if (isReveal) {
    // If peeking, use 'peek' variant. Else use 'revealTurn'
    currentHeadVariant = isPeeking ? "peek" : "revealTurn";
  } else if (isShy) {
    currentHeadVariant = "shy";
  } else if (distracted) {
    currentHeadVariant = "distracted";
  }

  // If we have a specific variant (Peeking, Focused, Distracted), use it.
  // Otherwise (null), we use the tracked spring values.

  // To satisfy "Non-aktifkan semua fungsi head tracking... selama state mengintip aktif":
  // We ensure that when currentHeadVariant is 'peek', we do NOT pass the tracked values.
  // We accomplish this by conditionally applying style props.

  return (
    <Motion.div
      className="absolute bottom-0 origin-bottom flex flex-col items-center justify-end"
      style={{
        left,
        width,
        height,
        backgroundColor: color,
        borderRadius,
        zIndex,
        rotate: 0, // Body static
      }}
      animate={breathing}
    >
      {/* HEAD CONTAINER - Independent Motion */}
      <Motion.div
        className="relative w-full h-full"
        style={{
          transformOrigin: "50% 60%", // Pivot around neck/upper chest area
          perspective: 800, // Enable 3D rotation effect

          // REQ 2: Head tracking (via style) active ONLY when no variant is set
          // When isPeeking (or any other variant) is active, these are ignored/overridden by animate
          // But to be safe and strictly follow "Non-aktifkan", we remove them from style if variant exists.
          x: currentHeadVariant ? 0 : smoothHeadX,
          y: currentHeadVariant ? 0 : smoothHeadY,
          rotateY: currentHeadVariant ? 0 : smoothHeadRotateY,
          rotateX: currentHeadVariant ? 0 : smoothHeadRotateX,
        }}
        animate={currentHeadVariant ? headVariants[currentHeadVariant] : {}}
        // Removed component-level transition prop to prevent conflicts
      >
        <Hands show={false} color={color === "#2D2D2D" ? "#1a1a1a" : color} />
        {children}
      </Motion.div>
    </Motion.div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusState, setFocusState] = useState("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const emailTargetCenter = useVectorToTarget(emailInputRef);
  const passwordTargetCenter = useVectorToTarget(passwordInputRef);

  const { x, y } = useMousePosition();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Interaction State
  const [interGaze, setInterGaze] = useState({
    purple: false,
    black: false,
    orange: false,
    yellow: false,
    target: null, // 'left', 'right' relative to char
  });

  // Password Peek State
  const [peekState, setPeekState] = useState({
    purple: false,
    black: false,
    orange: false,
    yellow: false,
  });

  const [blink, setBlink] = useState({
    purple: false,
    black: false,
    orange: false,
    yellow: false,
  });

  // --- FREEROAM STATE ---
  // REQ 2: Implement isFreeroamMode flag
  const [isFreeroamMode, setIsFreeroamMode] = useState(true);

  useEffect(() => {
    // Freeroam is active when no form is focused
    setIsFreeroamMode(focusState === "idle");
  }, [focusState]);

  // --- LOGIC A: Inter-character Gaze (Idle) ---
  // Refs for Enhanced Logic (Req 3)
  const lastGazeTime = useRef({}); // { charName: timestamp }
  const activeGazeCount = useRef(0);

  useEffect(() => {
    // Flag to track if this effect instance is active (to prevent zombie timeouts)
    let isEffectActive = true;
    let timer;

    if (focusState !== "idle") {
      setInterGaze({
        purple: false,
        black: false,
        orange: false,
        yellow: false,
        target: null,
      });
      activeGazeCount.current = 0;
      return;
    }

    // REQ 2: In Freeroam mode, disable inter-character gaze
    // Note: window._forceInterGaze allows testing the enhanced logic even when Freeroam is active
    if (isFreeroamMode && !window._forceInterGaze) {
      setInterGaze({
        purple: false,
        black: false,
        orange: false,
        yellow: false,
        target: null,
      });
      return;
    }

    // REQ 3: Enhanced Inter-Character Logic
    // Constrained pairs based on distance < 200px
    // P(70), B(240), Y(310), O(0)
    // Valid: O-P (70), P-B (170), B-Y (70)
    const validPairs = [
      ["orange", "purple"],
      ["purple", "black"],
      ["black", "yellow"],
    ];

    const runSequence = () => {
      if (!isEffectActive) return;

      // Queue Constraint: Max 2 characters looking (1 pair)
      if (activeGazeCount.current >= 2) {
        timer = setTimeout(runSequence, 1000);
        return;
      }

      // Probability Check (30% chance)
      if (Math.random() > 0.3) {
        timer = setTimeout(runSequence, 1000); // Try again soon
        return;
      }

      // Select random pair
      const pair = validPairs[Math.floor(Math.random() * validPairs.length)];
      const [char1, char2] = pair;
      const now = Date.now();

      // Cooldown Check (2-3s per character)
      const cd1 = lastGazeTime.current[char1] || 0;
      const cd2 = lastGazeTime.current[char2] || 0;
      const COOLDOWN = 3000;

      if (now - cd1 < COOLDOWN || now - cd2 < COOLDOWN) {
        timer = setTimeout(runSequence, 500);
        return;
      }

      // Execute Gaze
      setInterGaze((prev) => ({ ...prev, [char1]: true, [char2]: true }));
      activeGazeCount.current += 2;
      lastGazeTime.current[char1] = now;
      lastGazeTime.current[char2] = now;

      const duration = Math.random() * 1000 + 1000; // 1-2s gaze

      setTimeout(() => {
        if (!isEffectActive) return;
        setInterGaze((prev) => ({ ...prev, [char1]: false, [char2]: false }));
        activeGazeCount.current -= 2;

        // Next cycle
        timer = setTimeout(runSequence, Math.random() * 2000 + 2000);
      }, duration);
    };

    timer = setTimeout(runSequence, 1000);

    return () => {
      isEffectActive = false;
      clearTimeout(timer);
    };
  }, [focusState, isFreeroamMode]);

  // --- LOGIC C: Password Peek (Visible Mode) ---
  useEffect(() => {
    if (focusState === "password" && showPassword) {
      // Logic for random peeking
      // Requirements:
      // 1. Max 3-4 times in 10s -> Interval ~2500-3500ms
      // 2. Random variation 20-30%
      // 3. Delay minimal 800-1200ms (Peek Duration)

      const schedulePeek = (char) => {
        // Base Interval
        const baseInterval =
          Math.random() *
            (animConfig.passwordBehavior.visible.peekIntervalMax -
              animConfig.passwordBehavior.visible.peekIntervalMin) +
          animConfig.passwordBehavior.visible.peekIntervalMin;

        // Add 20-30% Random Variation
        const variation = baseInterval * (0.2 + Math.random() * 0.1);
        const finalInterval = baseInterval + variation;

        return setTimeout(() => {
          // Start Peeking
          setPeekState((prev) => ({ ...prev, [char]: true }));

          // Duration of Peek (800-1200ms based on config)
          setTimeout(() => {
            // End Peeking
            setPeekState((prev) => ({ ...prev, [char]: false }));
            // Reschedule
            schedulePeek(char);
          }, animConfig.passwordBehavior.visible.peekDuration);
        }, finalInterval);
      };

      const timers = [
        schedulePeek("purple"),
        schedulePeek("black"),
        schedulePeek("orange"),
        schedulePeek("yellow"),
      ];

      return () => timers.forEach((t) => clearTimeout(t));
    } else {
      setPeekState({
        purple: false,
        black: false,
        orange: false,
        yellow: false,
      });
    }
  }, [focusState, showPassword]);

  // Blinking Logic (Adjusted for focus state)
  const blinkTimers = useRef({});

  useEffect(() => {
    const triggerBlink = (char) => {
      setBlink((prev) => ({ ...prev, [char]: true }));
      setTimeout(
        () => setBlink((prev) => ({ ...prev, [char]: false })),
        animConfig.blinkDuration
      );

      let interval;
      if (focusState === "email") {
        interval = animConfig.emailFocus.blinkInterval;
      } else {
        // Weighted Random: Favor longer intervals (less frequent)
        // Using sqrt(random) pushes distribution towards 1 (max)
        const weight = Math.sqrt(Math.random());
        interval =
          animConfig.blinkInterval.min +
          weight *
            (animConfig.blinkInterval.max - animConfig.blinkInterval.min);
      }

      blinkTimers.current[char] = setTimeout(
        () => triggerBlink(char),
        interval
      );
    };

    const chars = ["purple", "black", "orange", "yellow"];
    // Initial random start
    chars.forEach((char) => {
      // Random start delay to avoid grouping at mount
      const delay = Math.random() * 5000 + 1000;
      blinkTimers.current[char] = setTimeout(() => triggerBlink(char), delay);
    });

    return () => {
      Object.values(blinkTimers.current).forEach(clearTimeout);
    };
  }, [focusState]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      login(response.user, response.access_token);
      toast.success(`Selamat datang, ${response.user.nama}`);
      navigate(response.user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      // Safely handle error message object or string
      const errorMessage = err.response?.data?.detail
        ? typeof err.response.data.detail === "object"
          ? JSON.stringify(err.response.data.detail)
          : err.response.data.detail
        : "Login gagal";

      setError(errorMessage);
      toast.error("Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  // --- DIRECTION LOGIC ---
  const getLookDirection = (charName) => {
    // 1. Password Focus
    if (focusState === "password") {
      if (showPassword) {
        // Visible Mode: Turned away (handled by Body Variant), look back if peeking
        if (peekState[charName]) {
          return { x: 2, y: 0.5 }; // Peek at form (Right)
        }
        return { x: -2, y: 0 }; // Look away (Left)
      } else {
        // Hidden Mode: Look at form from above (15-20 deg down)
        return { x: 0, y: 1.5 };
      }
    }

    // 2. Email Focus
    if (focusState === "email") {
      // Handled by EyeBall using targetCenter.
      // We return undefined to let vector logic take over, BUT we want specific constrained behavior.
      // We pass targetCenter prop to EyeBall.
      return undefined;
    }

    // 3. Idle / Inter-character Gaze
    if (interGaze[charName]) {
      // Define gaze targets for pairs
      if (charName === "purple") {
        if (interGaze.black) return { x: 1.5, y: 0.5 }; // Look at Black (Mid Right)
        if (interGaze.yellow) return { x: 2, y: 1 }; // Look at Yellow (Far Right)
      }
      if (charName === "black") {
        if (interGaze.purple) return { x: -1, y: 0 }; // Look at Purple (Back Left)
        if (interGaze.orange) return { x: -1.5, y: 1 }; // Look at Orange (Front Left)
      }
      if (charName === "orange") {
        if (interGaze.black) return { x: 1, y: -0.5 }; // Look at Black (Back Right)
      }
      if (charName === "yellow") {
        if (interGaze.purple) return { x: -1.5, y: -0.5 }; // Look at Purple (Back Left)
      }
    }

    return undefined; // Follow mouse
  };

  // --- EXPRESSION LOGIC ---
  const getExpression = (charName) => {
    // 1. Password Focus
    if (focusState === "password") {
      if (showPassword) {
        // Visible: Sombong + Penasaran when peeking
        if (peekState[charName]) return "curious"; // Or mix
        return "arrogant";
      } else {
        // Hidden: Jutek + Sombong
        return "jutek";
      }
    }

    // 2. Email Focus
    if (focusState === "email") {
      return "thinSmile"; // Arrogant with thin smile
    }

    // 3. Idle Gaze
    if (interGaze[charName]) {
      return "thinSmile"; // Or raised eyebrow
    }

    return "neutral";
  };

  const getEyebrowExpression = (charName) => {
    const expr = getExpression(charName);
    if (expr === "jutek") return "angry";
    if (expr === "thinSmile") return "arrogant";
    if (expr === "curious") return "raisedOne";
    return "neutral";
  };

  const getMouthExpression = (charName) => {
    return getExpression(charName);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-10 relative font-sans bg-[#F2F7FC] overflow-hidden">
      {/* Modern Premium Paper-Cut Wave Background */}
      <div className="fixed inset-0 z-0 bg-[#F2F7FC]" aria-hidden="true">
        {/* Base Layer - Lightest Blue */}
        <div className="absolute inset-0 bg-[#F2F7FC]" />

        {/* Wave Layer 1 - Soft Blue (Deepest/Furthest) */}
        <svg
          className="absolute inset-0 w-full h-full object-cover"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
        >
          <path
            fill="#E2EDF7"
            d="M0,256L60,266.7C120,277,240,299,360,282.7C480,267,600,213,720,208C840,203,960,245,1080,261.3C1200,277,1320,267,1380,261.3L1440,256L1440,800L1380,800C1320,800,1200,800,1080,800C960,800,840,800,720,800C600,800,480,800,360,800C240,800,120,800,60,800L0,800Z"
            className="drop-shadow-sm"
          />
        </svg>

        {/* Wave Layer 2 - Medium Blue */}
        <svg
          className="absolute inset-0 w-full h-full object-cover"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
        >
          <path
            fill="#CCDFF1"
            d="M0,416L60,421.3C120,427,240,437,360,416C480,395,600,341,720,346.7C840,352,960,416,1080,442.7C1200,469,1320,459,1380,453.3L1440,448L1440,800L1380,800C1320,800,1200,800,1080,800C960,800,840,800,720,800C600,800,480,800,360,800C240,800,120,800,60,800L0,800Z"
            className="drop-shadow-md"
          />
        </svg>

        {/* Wave Layer 3 - Accent Blue */}
        <svg
          className="absolute inset-0 w-full h-full object-cover"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
        >
          <path
            fill="#AACBE6"
            d="M0,576L48,565.3C96,555,192,533,288,544C384,555,480,597,576,608C672,619,768,597,864,570.7C960,544,1056,512,1152,512C1248,512,1344,544,1392,560L1440,576L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"
            className="drop-shadow-lg"
          />
        </svg>

        {/* Wave Layer 4 - Darkest Blue (Foreground) */}
        <svg
          className="absolute inset-0 w-full h-full object-cover"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
        >
          <path
            fill="#81AFD9"
            d="M0,704L40,688C80,672,160,640,240,645.3C320,651,400,693,480,704C560,715,640,693,720,666.7C800,640,880,608,960,608C1040,608,1120,640,1200,661.3C1280,683,1360,693,1400,698.7L1440,704L1440,800L1400,800C1360,800,1280,800,1200,800C1120,800,1040,800,960,800C880,800,800,800,720,800C640,800,560,800,480,800C400,800,320,800,240,800C160,800,80,800,40,800L0,800Z"
            className="drop-shadow-xl"
          />
        </svg>

        {/* Animated Orbs for Subtle Depth */}
        <div
          className="absolute top-[10%] left-[15%] w-[30vw] h-[30vw] bg-white rounded-full blur-[80px] opacity-40 mix-blend-overlay animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-teal-100 rounded-full blur-[100px] opacity-20 mix-blend-overlay animate-pulse"
          style={{ animationDuration: "15s", animationDelay: "3s" }}
        />

        {/* Noise Texture for Paper Feel */}
        <div className="absolute inset-0 opacity-[0.25] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjwvcmVjdD4KPC9zdmc+')] pointer-events-none mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] login-shell">
        <div className="login-shell__tint" aria-hidden="true" />
        <Motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch"
        >
          {/* Left Animation Section */}
          <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-white/30 backdrop-blur-xl lg:border-r lg:border-white/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]">
            {/* Animated Background Elements (Subtle) */}
            <Motion.div
              className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#709DD2]/20 rounded-full blur-3xl pointer-events-none"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            {/* Removed Logo Simoppel from here */}

            <div className="relative z-20 h-full min-h-[420px] flex items-center justify-center">
              <div className="relative w-[440px] h-[400px] origin-center scale-75 md:scale-90 xl:scale-100">
                {/* Purple Character (Back) */}
                <Character
                  color="#6C3FF5"
                  width="180px"
                  height="400px"
                  borderRadius="60px 60px 0 0"
                  zIndex={1}
                  left="50px"
                  mouseX={x}
                  mouseY={y}
                  delay={0}
                  focusState={focusState}
                  showPassword={showPassword}
                  distracted={focusState === "idle" && interGaze.purple}
                  distractionDirection={
                    interGaze.purple ? { x: 1, y: 0 } : { x: 0, y: 0 }
                  }
                  peekState={peekState.purple}
                >
                  <div className="absolute top-[80px] left-[35px] flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <Eyebrow
                          expression={getEyebrowExpression("purple")}
                          color="rgba(0,0,0,0.3)"
                        />
                        <EyeBall
                          size={36}
                          pupilSize={12}
                          mouseX={x}
                          mouseY={y}
                          blinkState={blink.purple}
                          forceLook={getLookDirection("purple")}
                          expression={
                            focusState === "email"
                              ? "focus"
                              : getExpression("purple")
                          }
                          delay={0.05}
                          targetCenter={
                            focusState === "email" || focusState === "password"
                              ? focusState === "email"
                                ? emailTargetCenter
                                : passwordTargetCenter
                              : undefined
                          }
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Eyebrow
                          expression={getEyebrowExpression("purple")}
                          color="rgba(0,0,0,0.3)"
                        />
                        <EyeBall
                          size={36}
                          pupilSize={12}
                          mouseX={x}
                          mouseY={y}
                          blinkState={blink.purple}
                          forceLook={getLookDirection("purple")}
                          expression={
                            focusState === "email"
                              ? "focus"
                              : getExpression("purple")
                          }
                          delay={0.05}
                          targetCenter={
                            focusState === "email" || focusState === "password"
                              ? focusState === "email"
                                ? emailTargetCenter
                                : passwordTargetCenter
                              : undefined
                          }
                        />
                      </div>
                    </div>
                    <Mouth
                      expression={getMouthExpression("purple")}
                      color="rgba(0,0,0,0.3)"
                    />
                  </div>
                </Character>

                {/* Black Character (Middle) */}
                <Character
                  color="#2D2D2D"
                  width="120px"
                  height="310px"
                  borderRadius="50px 50px 0 0"
                  zIndex={2}
                  left="220px"
                  mouseX={x}
                  mouseY={y}
                  delay={0.5}
                  focusState={focusState}
                  showPassword={showPassword}
                  distracted={focusState === "idle" && interGaze.black}
                  distractionDirection={
                    interGaze.black ? { x: -1, y: 0 } : { x: 0, y: 0 }
                  }
                  peekState={peekState.black}
                >
                  <div className="absolute top-[60px] left-[15px] flex flex-col items-center gap-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Eyebrow
                          expression={getEyebrowExpression("black")}
                          color="rgba(255,255,255,0.3)"
                        />
                        <EyeBall
                          size={30}
                          pupilSize={10}
                          mouseX={x}
                          mouseY={y}
                          blinkState={blink.black}
                          forceLook={getLookDirection("black")}
                          expression={
                            focusState === "email"
                              ? "focus"
                              : getExpression("black")
                          }
                          delay={0.1}
                          targetCenter={
                            focusState === "email" || focusState === "password"
                              ? focusState === "email"
                                ? emailTargetCenter
                                : passwordTargetCenter
                              : undefined
                          }
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Eyebrow
                          expression={getEyebrowExpression("black")}
                          color="rgba(255,255,255,0.3)"
                        />
                        <EyeBall
                          size={30}
                          pupilSize={10}
                          mouseX={x}
                          mouseY={y}
                          blinkState={blink.black}
                          forceLook={getLookDirection("black")}
                          expression={
                            focusState === "email"
                              ? "focus"
                              : getExpression("black")
                          }
                          delay={0.1}
                          targetCenter={
                            focusState === "email" || focusState === "password"
                              ? focusState === "email"
                                ? emailTargetCenter
                                : passwordTargetCenter
                              : undefined
                          }
                        />
                      </div>
                    </div>
                    <div className="w-4 h-1 bg-white/20 rounded-full mt-2" />
                  </div>
                </Character>

                {/* Yellow Character (Front Right) */}
                <Character
                  color="#E8D754"
                  width="140px"
                  height="230px"
                  borderRadius="70px 70px 0 0"
                  zIndex={3}
                  left="280px"
                  mouseX={x}
                  mouseY={y}
                  delay={1}
                  focusState={focusState}
                  showPassword={showPassword}
                  distracted={focusState === "idle" && interGaze.yellow}
                  distractionDirection={
                    interGaze.yellow ? { x: -1, y: 0 } : { x: 0, y: 0 }
                  }
                  peekState={peekState.yellow}
                >
                  <div className="absolute top-[60px] left-[25px] flex flex-col items-center gap-3">
                    <div className="flex gap-4">
                      <EyeBall
                        size={26}
                        pupilSize={11}
                        mouseX={x}
                        mouseY={y}
                        blinkState={blink.yellow}
                        pupilColor="black"
                        eyeColor="white"
                        forceLook={getLookDirection("yellow")}
                        expression={
                          focusState === "email"
                            ? "focus"
                            : getExpression("yellow")
                        }
                        delay={0.15}
                        targetCenter={
                          focusState === "email" || focusState === "password"
                            ? focusState === "email"
                              ? emailTargetCenter
                              : passwordTargetCenter
                            : undefined
                        }
                      />
                      <EyeBall
                        size={26}
                        pupilSize={11}
                        mouseX={x}
                        mouseY={y}
                        blinkState={blink.yellow}
                        pupilColor="black"
                        eyeColor="white"
                        forceLook={getLookDirection("yellow")}
                        expression={
                          focusState === "email"
                            ? "focus"
                            : getExpression("yellow")
                        }
                        delay={0.15}
                        targetCenter={
                          focusState === "email" || focusState === "password"
                            ? focusState === "email"
                              ? emailTargetCenter
                              : passwordTargetCenter
                            : undefined
                        }
                      />
                    </div>
                    <Mouth
                      expression={getMouthExpression("yellow")}
                      color="black"
                    />
                  </div>
                </Character>

                {/* Orange Character (Front Left) */}
                <Character
                  color="#FF9B6B"
                  width="200px"
                  height="200px"
                  borderRadius="100px 100px 0 0"
                  zIndex={4}
                  left="0px"
                  mouseX={x}
                  mouseY={y}
                  delay={1.5}
                  focusState={focusState}
                  showPassword={showPassword}
                  distracted={focusState === "idle" && interGaze.orange}
                  distractionDirection={
                    interGaze.orange ? { x: 1, y: 0 } : { x: 0, y: 0 }
                  }
                  peekState={peekState.orange}
                >
                  <div className="absolute top-[60px] left-[45px] flex flex-col items-center gap-3">
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center gap-1">
                        <Eyebrow
                          expression={getEyebrowExpression("orange")}
                          color="black"
                        />
                        <EyeBall
                          size={24}
                          pupilSize={10}
                          mouseX={x}
                          mouseY={y}
                          blinkState={blink.orange}
                          pupilColor="black"
                          eyeColor="white"
                          forceLook={getLookDirection("orange")}
                          expression={
                            focusState === "email"
                              ? "focus"
                              : getExpression("orange")
                          }
                          delay={0.2}
                          targetCenter={
                            focusState === "email" || focusState === "password"
                              ? focusState === "email"
                                ? emailTargetCenter
                                : passwordTargetCenter
                              : undefined
                          }
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Eyebrow
                          expression={getEyebrowExpression("orange")}
                          color="black"
                        />
                        <EyeBall
                          size={24}
                          pupilSize={10}
                          mouseX={x}
                          mouseY={y}
                          blinkState={blink.orange}
                          pupilColor="black"
                          eyeColor="white"
                          forceLook={getLookDirection("orange")}
                          expression={
                            focusState === "email"
                              ? "focus"
                              : getExpression("orange")
                          }
                          delay={0.2}
                          targetCenter={
                            focusState === "email" || focusState === "password"
                              ? focusState === "email"
                                ? emailTargetCenter
                                : passwordTargetCenter
                              : undefined
                          }
                        />
                      </div>
                    </div>
                    <Mouth
                      expression={getMouthExpression("orange")}
                      color="black"
                    />
                  </div>
                </Character>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center p-8 lg:p-12 overflow-hidden bg-white/60 backdrop-blur-xl shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.1)]">
            <div className="w-full max-w-[400px]">
              {/* Header Logos */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <img
                  src="/logo-bps.png"
                  alt="Logo BPS"
                  className="h-12 w-auto object-contain drop-shadow-sm"
                />
                <div className="h-8 w-[1px] bg-slate-400/50" /> {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                    <Sparkles className="size-5 text-blue-600" />
                  </div>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">
                    Simoppel
                  </span>
                </div>
              </div>

              <div className="text-center mb-10">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2 text-slate-800">
                  Selamat Datang!
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  Masuk ke akun Anda untuk melanjutkan
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Email
                  </Label>
                  <Input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusState("email")}
                    onBlur={() => setFocusState("idle")}
                    required
                    className="h-11 rounded-xl bg-white/60 border-white/40 focus:border-[#3B82F6]/60 focus:ring-[#3B82F6]/20 transition-all duration-300 focus:scale-[1.01] shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusState("password")}
                      onBlur={() => setFocusState("idle")}
                      required
                      className="h-11 pr-10 rounded-xl bg-white/60 border-white/40 focus:border-[#3B82F6]/60 focus:ring-[#3B82F6]/20 transition-all duration-300 focus:scale-[1.01] shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors duration-300 p-1.5 rounded-lg hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      className="rounded-md border-gray-900/20 text-primary focus:ring-primary"
                    />
                    <Label
                      htmlFor="remember"
                      className="cursor-pointer text-sm text-gray-700 font-medium"
                    >
                      Ingat saya
                    </Label>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-semibold transition-colors duration-300"
                  >
                    Lupa password?
                  </a>
                </div>

                {error && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </Motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] shadow-lg shadow-[#3B82F6]/25 hover:shadow-[#06B6D4]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Memproses..." : "Masuk"}
                </Button>
              </form>

              <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                &copy; {new Date().getFullYear()} Simoppel BPS. All rights
                reserved.
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
