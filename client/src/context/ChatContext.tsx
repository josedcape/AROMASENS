import { createContext, ReactNode, useContext, useReducer } from "react";
import { ChatStep, ChatState, ChatMessage, PerfumeRecommendation } from "@/lib/types";

type ChatAction =
  | { type: "SET_GENDER"; payload: string }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_STEP"; payload: ChatStep }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_QUICK_RESPONSES"; payload: string[] | undefined }
  | { type: "SET_USER_RESPONSE"; payload: { key: string; value: string } }
  | { type: "SET_RECOMMENDATION"; payload: PerfumeRecommendation }
  | { type: "RESET" };

const initialState: ChatState = {
  selectedGender: "",
  currentStep: ChatStep.AGE,
  messages: [],
  isTyping: false,
  userResponses: {
    gender: "",
    age: "",
    experience: "",
    occasion: "",
    preferences: "",
  },
};

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_GENDER":
      return {
        ...state,
        selectedGender: action.payload,
        userResponses: {
          ...state.userResponses,
          gender: action.payload,
        },
      };

    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "SET_TYPING":
      return {
        ...state,
        isTyping: action.payload,
      };

    case "SET_QUICK_RESPONSES":
      return {
        ...state,
        quickResponses: action.payload,
      };

    case "SET_USER_RESPONSE":
      return {
        ...state,
        userResponses: {
          ...state.userResponses,
          [action.payload.key]: action.payload.value,
        },
      };

    case "RESET":
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
