import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { MessageSquare, Layout } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAgentModal({
  isOpen,
  onClose,
}: CreateAgentModalProps) {
  const router = useRouter();

  const handleSelection = (type: "chat" | "custom") => {
    if (type === "chat") {
      router.push("/chat");
    } else {
      router.push("/explore/create");
    }
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[var(--background)] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-textDark dark:text-textLight"
                >
                  Choose Creation Method
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-sm text-textDark/60 dark:text-textLight/60">
                    Select how you would like to create your agent
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelection("chat")}
                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-primary/10 transition-colors"
                  >
                    <MessageSquare size={24} className="mb-2" />
                    <span className="font-medium">Chat Interface</span>
                    <span className="text-sm text-textDark/60 dark:text-textLight/60 mt-1">
                      Create through conversation
                    </span>
                  </button>

                  <button
                    onClick={() => handleSelection("custom")}
                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-primary/10 transition-colors"
                  >
                    <Layout size={24} className="mb-2" />
                    <span className="font-medium">Custom UI</span>
                    <span className="text-sm text-textDark/60 dark:text-textLight/60 mt-1">
                      Create with form interface
                    </span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
