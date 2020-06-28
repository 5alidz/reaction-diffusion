import { motion } from 'framer-motion';

export default function Message({ children }: { children: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <pre className='w-screen h-screen flex items-center justify-center'>{children}</pre>
    </motion.div>
  );
}
